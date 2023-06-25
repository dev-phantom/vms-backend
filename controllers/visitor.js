const Visitor = require("../models/visitor");
const Staff = require("../models/staff");
const ErrorResponse = require("../utils/errorResponse");

// Load all visitors
exports.allVisitor = async (req, res, next) => {
  const pageSize = 15;
  const page = Number(req.query.pageNumber) || 1;
  try {
    const count = await Visitor.countDocuments({});
    const visitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      success: true,
      visitors,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Create a visitor
exports.createVisitor = async (req, res, next) => {
  const { email } = req.body;
  try {
    const visitorExist = await Visitor.findOne({ email });

    if (visitorExist) {
      return next(
        new ErrorResponse("Visitor with this email already exists", 400)
      );
    }

    const visitor = await Visitor.create({
      ...req.body,
      createdByStaff: false,
    });

    res.status(201).json({
      success: true,
      visitor,
    });
  } catch (error) {
    next(error);
  }
};

// Create a visitor by staff admin
exports.createVisitorByStaff = async (req, res, next) => {
  const { email, staffAdminId } = req.body;
  try {
    const visitorExist = await Visitor.findOne({ email });

    if (visitorExist) {
      return next(
        new ErrorResponse("Visitor with this email already exists", 400)
      );
    }

    const staffAdmin = await Staff.findById(staffAdminId);
    if (!staffAdmin) {
      return next(new ErrorResponse("Staff admin not found", 404));
    }

    const visitor = await Visitor.create({
      ...req.body,
      createdByStaff: true,
      staffAdminId,
    });

    res.status(201).json({
      success: true,
      visitor,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single visitor by ID
exports.getVisitorById = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return next(new ErrorResponse("Visitor not found", 404));
    }

    res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    next(error);
  }
};

// Check if a visitor has checked in or not
exports.checkVisitorCheckedIn = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return next(new ErrorResponse("Visitor not found", 404));
    }

    res.status(200).json({
      success: true,
      checkedIn: visitor.checkedIn,
    });
  } catch (error) {
    next(error);
  }
};

// Update check-in status of a visitor
exports.updateCheckInStatus = async (req, res, next) => {
  const { id } = req.params;
  const { checkedIn } = req.body;

  try {
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return next(new ErrorResponse("Visitor not found", 404));
    }

    visitor.checkedIn = checkedIn;
    await visitor.save();

    res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    next(error);
  }
};
// Get all checked-in visitors
exports.getCheckedInVisitors = async (req, res, next) => {
  try {
    const checkedInVisitors = await Visitor.find({ checkedIn: true });

    res.status(200).json({
      success: true,
      visitors: checkedInVisitors,
    });
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Get all visitors that are not checked in
exports.getNotCheckedInVisitors = async (req, res, next) => {
  try {
    const notCheckedInVisitors = await Visitor.find({ checkedIn: false });

    res.status(200).json({
      success: true,
      visitors: notCheckedInVisitors,
    });
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Get all invited visitors
exports.getInvitedVisitors = async (req, res, next) => {
  try {
    const invitedVisitors = await Visitor.find({ invited : true });

    res.status(200).json({
      success: true,
      visitors: invitedVisitors,
    });
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Get all invited visitors
exports.getNotInvitedVisitors = async (req, res, next) => {
  try {
    const nonInvitedVisitors = await Visitor.find({ invited : false });

    res.status(200).json({
      success: true,
      visitors: nonInvitedVisitors,
    });
    
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};
