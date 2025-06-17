import express from 'express';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Generate report
router.post('/generate', async (req, res) => {
  try {
    const { reportType, dateRange, format, accounts } = req.body;
    const db = req.app.locals.db;

    // Fetch report data based on type
    let reportData;
    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(req.user.userId, dateRange, accounts, db);
        break;
      case 'audience':
        reportData = await generateAudienceReport(req.user.userId, dateRange, accounts, db);
        break;
      case 'content':
        reportData = await generateContentReport(req.user.userId, dateRange, accounts, db);
        break;
      case 'engagement':
        reportData = await generateEngagementReport(req.user.userId, dateRange, accounts, db);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Generate file based on format
    let filePath;
    switch (format.toLowerCase()) {
      case 'pdf':
        filePath = await generatePDFReport(reportData, reportType);
        break;
      case 'csv':
        filePath = await generateCSVReport(reportData, reportType);
        break;
      case 'excel':
        filePath = await generateExcelReport(reportData, reportType);
        break;
      default:
        return res.status(400).json({ error: 'Invalid format' });
    }

    // Send file
    res.download(filePath, (err) => {
      if (err) {
        console.error('File download error:', err);
      }
      // Clean up file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('File cleanup error:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get scheduled reports
router.get('/scheduled', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const [reports] = await db.execute(
      'SELECT * FROM scheduled_reports WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(reports);

  } catch (error) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled reports' });
  }
});

// Create scheduled report
router.post('/schedule', async (req, res) => {
  try {
    const { name, reportType, frequency, format, accounts, recipients } = req.body;
    const db = req.app.locals.db;

    const [result] = await db.execute(`
      INSERT INTO scheduled_reports 
      (user_id, name, report_type, frequency, format, accounts, recipients, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [
      req.user.userId,
      name,
      reportType,
      frequency,
      format,
      JSON.stringify(accounts),
      JSON.stringify(recipients)
    ]);

    res.json({ 
      id: result.insertId,
      message: 'Scheduled report created successfully' 
    });

  } catch (error) {
    console.error('Schedule report error:', error);
    res.status(500).json({ error: 'Failed to schedule report' });
  }
});

// Helper functions for generating different report types
async function generateOverviewReport(userId, dateRange, accounts, db) {
  const [metrics] = await db.execute(`
    SELECT 
      SUM(p.likes_count) as total_likes,
      SUM(p.comments_count) as total_comments,
      SUM(p.shares_count) as total_shares,
      SUM(p.engagement_count) as total_engagement,
      COUNT(p.id) as total_posts,
      AVG(p.engagement_count) as avg_engagement
    FROM posts p
    JOIN connected_accounts ca ON p.account_id = ca.id
    WHERE ca.user_id = ?
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [userId, parseInt(dateRange) || 30]);

  const [topPosts] = await db.execute(`
    SELECT p.*, ca.platform, ca.account_name
    FROM posts p
    JOIN connected_accounts ca ON p.account_id = ca.id
    WHERE ca.user_id = ?
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    ORDER BY p.engagement_count DESC
    LIMIT 10
  `, [userId, parseInt(dateRange) || 30]);

  return {
    summary: metrics[0],
    topPosts,
    reportType: 'Performance Overview',
    dateRange,
    generatedAt: new Date()
  };
}

async function generateAudienceReport(userId, dateRange, accounts, db) {
  // This would typically fetch audience demographics from the platforms
  // For now, returning mock data structure
  return {
    demographics: {
      age: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 22 },
        { range: '45-54', percentage: 12 },
        { range: '55+', percentage: 6 }
      ],
      gender: [
        { type: 'Female', percentage: 58 },
        { type: 'Male', percentage: 40 },
        { type: 'Other', percentage: 2 }
      ]
    },
    reportType: 'Audience Report',
    dateRange,
    generatedAt: new Date()
  };
}

async function generateContentReport(userId, dateRange, accounts, db) {
  const [contentTypes] = await db.execute(`
    SELECT 
      COALESCE(p.post_type, 'post') as content_type,
      COUNT(*) as count,
      AVG(p.engagement_count) as avg_engagement,
      SUM(p.likes_count) as total_likes,
      SUM(p.comments_count) as total_comments
    FROM posts p
    JOIN connected_accounts ca ON p.account_id = ca.id
    WHERE ca.user_id = ?
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY COALESCE(p.post_type, 'post')
    ORDER BY avg_engagement DESC
  `, [userId, parseInt(dateRange) || 30]);

  return {
    contentTypes,
    reportType: 'Content Analysis',
    dateRange,
    generatedAt: new Date()
  };
}

async function generateEngagementReport(userId, dateRange, accounts, db) {
  const [engagementData] = await db.execute(`
    SELECT 
      DATE(p.created_at) as date,
      SUM(p.engagement_count) as daily_engagement,
      COUNT(p.id) as posts_count
    FROM posts p
    JOIN connected_accounts ca ON p.account_id = ca.id
    WHERE ca.user_id = ?
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(p.created_at)
    ORDER BY date DESC
  `, [userId, parseInt(dateRange) || 30]);

  return {
    dailyEngagement: engagementData,
    reportType: 'Engagement Report',
    dateRange,
    generatedAt: new Date()
  };
}

// Helper functions for generating different file formats
async function generatePDFReport(data, reportType) {
  const doc = new PDFDocument();
  const fileName = `${reportType}-${Date.now()}.pdf`;
  const filePath = path.join('/tmp', fileName);
  
  doc.pipe(fs.createWriteStream(filePath));
  
  // Add content to PDF
  doc.fontSize(20).text(`${data.reportType}`, 50, 50);
  doc.fontSize(12).text(`Generated: ${data.generatedAt.toLocaleDateString()}`, 50, 80);
  doc.fontSize(12).text(`Date Range: ${data.dateRange} days`, 50, 100);
  
  if (data.summary) {
    doc.fontSize(16).text('Summary', 50, 140);
    doc.fontSize(12).text(`Total Posts: ${data.summary.total_posts}`, 50, 170);
    doc.fontSize(12).text(`Total Engagement: ${data.summary.total_engagement}`, 50, 190);
    doc.fontSize(12).text(`Average Engagement: ${Math.round(data.summary.avg_engagement)}`, 50, 210);
  }
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => resolve(filePath));
  });
}

async function generateCSVReport(data, reportType) {
  const fileName = `${reportType}-${Date.now()}.csv`;
  const filePath = path.join('/tmp', fileName);
  
  let csvData = [];
  
  if (data.topPosts) {
    csvData = data.topPosts.map(post => ({
      content: post.content,
      platform: post.platform,
      likes: post.likes_count,
      comments: post.comments_count,
      shares: post.shares_count,
      engagement: post.engagement_count,
      created_at: post.created_at
    }));
  } else if (data.contentTypes) {
    csvData = data.contentTypes;
  } else if (data.dailyEngagement) {
    csvData = data.dailyEngagement;
  }
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: Object.keys(csvData[0] || {}).map(key => ({ id: key, title: key }))
  });
  
  await csvWriter.writeRecords(csvData);
  return filePath;
}

async function generateExcelReport(data, reportType) {
  // For simplicity, generating CSV format for Excel
  // In production, you'd use a library like 'exceljs'
  return await generateCSVReport(data, reportType);
}

export default router;