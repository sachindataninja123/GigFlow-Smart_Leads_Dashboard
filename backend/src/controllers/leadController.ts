import { Request, Response, NextFunction } from "express";
import { Lead } from "../models/Lead";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { LeadFilters, LeadStatus, LeadSource } from "../types";
import { config } from "../config";
import { format } from "fast-csv";
import mongoose from "mongoose";

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status: status || "New",
      source,
      notes,
      createdBy: req.user?.userId,
    });

    const populated = await lead.populate("createdBy", "name email");
    sendSuccess(res, "Lead created successfully.", populated, 201);
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = "latest",
      page = 1,
      limit = config.defaultPageLimit,
    } = req.query as unknown as LeadFilters;

    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (source) query.source = source;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // For sales users, only show their own leads
    if (req.user?.role === "sales") {
      query.createdBy = new mongoose.Types.ObjectId(req.user.userId);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = sort === "oldest" ? 1 : -1;

    const [items, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name email")
        .lean(),
      Lead.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendPaginated(res, "Leads fetched successfully.", {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Sales users can only view their own leads
    if (
      req.user?.role === "sales" &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      sendError(res, "You do not have permission to view this lead.", 403);
      return;
    }

    sendSuccess(res, "Lead fetched successfully.", lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === "sales" &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      sendError(res, "You do not have permission to update this lead.", 403);
      return;
    }

    const { name, email, status, source, notes } = req.body;
    const allowedUpdates: Partial<{
      name: string;
      email: string;
      status: LeadStatus;
      source: LeadSource;
      notes: string;
    }> = {};

    if (name !== undefined) allowedUpdates.name = name;
    if (email !== undefined) allowedUpdates.email = email;
    if (status !== undefined) allowedUpdates.status = status;
    if (source !== undefined) allowedUpdates.source = source;
    if (notes !== undefined) allowedUpdates.notes = notes;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    ).populate("createdBy", "name email");

    sendSuccess(res, "Lead updated successfully.", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Only admin can delete, or sales users their own leads
    if (
      req.user?.role === "sales" &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      sendError(res, "You do not have permission to delete this lead.", 403);
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);
    sendSuccess(res, "Lead deleted successfully.");
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status, source, search } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
    };

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    if (req.user?.role === "sales") {
      query.createdBy = req.user.userId;
    }

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name")
      .lean();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leads-${Date.now()}.csv`,
    );

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    leads.forEach((lead) => {
      csvStream.write({
        ID: lead._id.toString(),
        Name: lead.name,
        Email: lead.email,
        Status: lead.status,
        Source: lead.source,
        Notes: lead.notes || "",
        "Created By": (lead.createdBy as { name?: string })?.name || "",
        "Created At": new Date(lead.createdAt).toISOString(),
        "Updated At": new Date(lead.updatedAt).toISOString(),
      });
    });

    csvStream.end();
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query: Record<string, unknown> = {};
    if (req.user?.role === "sales") {
      query.createdBy = new mongoose.Types.ObjectId(req.user.userId);
    }

    const [statusStats, sourceStats, total] = await Promise.all([
      Lead.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: query },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(query),
    ]);

    sendSuccess(res, "Stats fetched successfully.", {
      total,
      byStatus: statusStats.reduce(
        (acc: Record<string, number>, s: { _id: string; count: number }) => {
          acc[s._id] = s.count;
          return acc;
        },
        {},
      ),
      bySource: sourceStats.reduce(
        (acc: Record<string, number>, s: { _id: string; count: number }) => {
          acc[s._id] = s.count;
          return acc;
        },
        {},
      ),
    });
  } catch (error) {
    next(error);
  }
};
