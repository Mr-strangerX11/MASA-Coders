export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import DailyReport from '@/models/DailyReport';
import Attendance from '@/models/Attendance';
import { requireStaff } from '@/lib/auth';

// Scoring rules
const SCORES = {
  taskCompleted:  10,
  onTimeBonus:     5,
  clientApproval:  8,
  dailyReport:     2,
  lateCompletion: -3,
  bugReport:      -5,
  missedDeadline:-10,
};

function getBadge(score) {
  if (score >= 500) return 'diamond';
  if (score >= 300) return 'platinum';
  if (score >= 200) return 'gold';
  if (score >= 100) return 'silver';
  return 'bronze';
}

export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // weekly|monthly|yearly
    const department = searchParams.get('department');

    const now = new Date();
    let startDate;
    if (period === 'weekly') {
      startDate = new Date(now); startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Get all staff
    const staffFilter = { role: { $in: ['staff', 'manager', 'editor'] }, isActive: true };
    if (department) staffFilter.department = department;
    const staffList = await User.find(staffFilter).lean();
    const staffIds = staffList.map(s => s._id);

    // Aggregate tasks
    const taskAgg = await Task.aggregate([
      {
        $match: {
          assigneeIds: { $in: staffIds },
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$assigneeIds' },
      {
        $group: {
          _id: '$assigneeIds',
          completed:   { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          onTime:      { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'done'] }, { $lte: ['$completedAt', '$dueDate'] }] }, 1, 0] } },
          late:        { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'done'] }, { $gt: ['$completedAt', '$dueDate'] }] }, 1, 0] } },
          overdue:     { $sum: { $cond: [{ $and: [{ $ne: ['$status', 'done'] }, { $lt: ['$dueDate', new Date()] }] }, 1, 0] } },
          bugs:        { $sum: { $cond: [{ $eq: ['$type', 'bug'] }, 1, 0] } },
          approved:    { $sum: { $cond: ['$isApproved', 1, 0] } },
          totalPoints: { $sum: '$pointsAwarded' },
        },
      },
    ]);

    // Aggregate daily reports
    const reportAgg = await DailyReport.aggregate([
      { $match: { userId: { $in: staffIds }, date: { $gte: startDate } } },
      { $group: { _id: '$userId', reportCount: { $sum: 1 }, hoursLogged: { $sum: '$hoursWorked' } } },
    ]);

    const taskMap   = Object.fromEntries(taskAgg.map(t => [t._id.toString(), t]));
    const reportMap = Object.fromEntries(reportAgg.map(r => [r._id.toString(), r]));

    const leaderboard = staffList.map(user => {
      const uid = user._id.toString();
      const t = taskMap[uid]  || { completed: 0, onTime: 0, late: 0, overdue: 0, bugs: 0, approved: 0 };
      const r = reportMap[uid] || { reportCount: 0, hoursLogged: 0 };

      const score =
        t.completed   * SCORES.taskCompleted  +
        t.onTime      * SCORES.onTimeBonus    +
        t.approved    * SCORES.clientApproval +
        r.reportCount * SCORES.dailyReport    +
        t.late        * SCORES.lateCompletion +
        t.bugs        * SCORES.bugReport      +
        t.overdue     * SCORES.missedDeadline;

      return {
        userId:           user._id,
        name:             user.name,
        avatar:           user.avatar,
        email:            user.email,
        department:       user.department,
        jobTitle:         user.jobTitle,
        tasksCompleted:   t.completed,
        tasksOnTime:      t.onTime,
        tasksLate:        t.late,
        tasksOverdue:     t.overdue,
        bugsReported:     t.bugs,
        clientApprovals:  t.approved,
        dailyReports:     r.reportCount,
        hoursLogged:      r.hoursLogged,
        score:            Math.max(0, score),
        badge:            getBadge(Math.max(0, score)),
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    return NextResponse.json({ leaderboard, period, scoringRules: SCORES });
  } catch (err) {
    console.error('GET /api/leaderboard:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
