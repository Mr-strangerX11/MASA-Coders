export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkProject from '@/models/WorkProject';
import Task from '@/models/Task';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import Ticket from '@/models/Ticket';
import DailyReport from '@/models/DailyReport';
import Attendance from '@/models/Attendance';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const now    = new Date();
    const y      = now.getFullYear();
    const m      = now.getMonth();

    const yearStart  = new Date(y, 0, 1);
    const monthStart = new Date(y, m, 1);
    const last6Start = new Date(y, m - 5, 1);
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0,0,0,0);

    const [
      // Projects
      totalProjects, activeProjects, completedProjects, projectsByStatus,
      // Tasks
      totalTasks, tasksByStatus, tasksCompletedThisMonth,
      // Finance
      invoicesByMonth, revenueByStatus,
      // Team
      staffCount, clientCount,
      // Tickets
      ticketsByStatus,
      // Reports
      reportsThisWeek,
      // Recent activity
      recentProjects, recentInvoices,
    ] = await Promise.all([
      WorkProject.countDocuments(),
      WorkProject.countDocuments({ status: 'active' }),
      WorkProject.countDocuments({ status: 'completed' }),
      WorkProject.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.countDocuments({ status: 'done', completedAt: { $gte: monthStart } }),
      // Monthly revenue for last 6 months
      Invoice.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: last6Start } } },
        { $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          revenue: { $sum: '$total' },
          count:   { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Invoice.aggregate([{ $group: { _id: '$status', total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      User.countDocuments({ role: { $in: ['staff','manager','editor'] }, isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      DailyReport.countDocuments({ date: { $gte: weekStart } }),
      WorkProject.find({ status: { $in: ['active','planning'] } }).select('title status progress deadline color').sort({ updatedAt: -1 }).limit(5).lean(),
      Invoice.find({ status: { $in: ['sent','viewed','overdue'] } }).populate('clientId','name company').select('invoiceNumber total currency dueDate status').sort({ dueDate: 1 }).limit(5).lean(),
    ]);

    // Build 6-month revenue array
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const date  = new Date(y, m - i, 1);
      const yr    = date.getFullYear();
      const mo    = date.getMonth() + 1;
      const found = invoicesByMonth.find(x => x._id.year === yr && x._id.month === mo);
      revenueChart.push({
        month:   monthNames[mo - 1],
        revenue: found?.revenue || 0,
        invoices:found?.count   || 0,
      });
    }

    // Task completion rate per day (last 7 days)
    const taskTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0,0,0,0);
      const d2 = new Date(d); d2.setHours(23,59,59,999);
      const count = await Task.countDocuments({ status: 'done', completedAt: { $gte: d, $lte: d2 } });
      taskTrend.push({ day: d.toLocaleDateString('en-US',{weekday:'short'}), completed: count });
    }

    // Normalize aggregation results
    const normalize = (arr, key = 'count') => {
      const map = {};
      arr.forEach(x => { map[x._id] = x[key] || x.count || 0; });
      return map;
    };

    const projectStatus = normalize(projectsByStatus);
    const taskStatus    = normalize(tasksByStatus);
    const ticketStatus  = normalize(ticketsByStatus);
    const revByStatus   = revenueByStatus.reduce((acc, x) => {
      acc[x._id] = { total: x.total, count: x.count };
      return acc;
    }, {});

    const totalRevenue    = revByStatus.paid?.total      || 0;
    const pendingRevenue  = (revByStatus.sent?.total     || 0) + (revByStatus.viewed?.total || 0);
    const overdueRevenue  = revByStatus.overdue?.total   || 0;

    return NextResponse.json({
      summary: {
        totalProjects, activeProjects, completedProjects,
        totalTasks,
        tasksCompletedThisMonth,
        staffCount, clientCount,
        totalRevenue, pendingRevenue, overdueRevenue,
        openTickets: (ticketStatus.open || 0) + (ticketStatus.in_progress || 0),
        reportsThisWeek,
      },
      charts: {
        revenue:  revenueChart,
        taskTrend,
        projectStatus: Object.entries(projectStatus).map(([name, value]) => ({ name, value })),
        taskStatus:    Object.entries(taskStatus).map(([name, value]) => ({ name, value })),
        ticketStatus:  Object.entries(ticketStatus).map(([name, value]) => ({ name, value })),
      },
      recent: {
        projects: recentProjects,
        invoices: JSON.parse(JSON.stringify(recentInvoices)),
      },
    });
  } catch (err) {
    console.error('GET /api/analytics/overview:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
