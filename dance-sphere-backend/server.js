const express = require("express");
const cors = require("cors");
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ⭐ RAZORPAY CONFIGURATION
// Replace these with your actual keys from Razorpay dashboard
const razorpay = new Razorpay({
  key_id: 'rzp_test_YOUR_KEY_ID',      // ⬅️ REPLACE THIS
  key_secret: 'YOUR_KEY_SECRET'        // ⬅️ REPLACE THIS
});

// Dummy slot data
let slots = [
  {
    id: 1,
    date: "2025-12-12",
    day: "Friday",
    time: "6:00 PM - 7:00 PM",
    style: "Bollywood",
    level: "Beginner",
    maxSeats: 10,
    bookedCount: 3,
    price: 500
  },
  {
    id: 2,
    date: "2025-12-13",
    day: "Saturday",
    time: "5:00 PM - 6:30 PM",
    style: "Hip-Hop",
    level: "Intermediate",
    maxSeats: 12,
    bookedCount: 8,
    price: 600
  }
];

// Save bookings (in-memory storage)
let bookings = [];

// Homepage check
app.get("/", (req, res) => {
  res.send("Dance Sphere API is running ✨");
});

// Get all slots
app.get("/api/slots", (req, res) => {
  res.json(slots);
});

// ==========================================
// RAZORPAY PAYMENT ENDPOINTS
// ==========================================

// CREATE RAZORPAY ORDER
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, slotId, name, email, phone } = req.body;

    // Validate slot availability
    const slot = slots.find(s => s.id === slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.bookedCount >= slot.maxSeats) {
      return res.status(400).json({ message: 'Slot is full' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise (₹500 = 50000 paise)
      currency: "INR",
      receipt: `receipt_${slotId}_${Date.now()}`,
      notes: {
        slotId: slotId,
        name: name,
        email: email || '',
        phone: phone
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      slotDetails: {
        style: slot.style,
        day: slot.day,
        time: slot.time
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// VERIFY PAYMENT AND COMPLETE BOOKING
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      slotId,
      name,
      phone,
      email,
      choreographer
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", "YOUR_KEY_SECRET")  // ⬅️ REPLACE with your secret
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment verified! Now complete the booking
    const slot = slots.find(s => s.id === slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.bookedCount >= slot.maxSeats) {
      return res.status(400).json({ message: 'Slot is full' });
    }

    // Create booking
    const newBooking = {
      id: Date.now(),
      slotId,
      name,
      phone,
      email: email || "",
      choreographer,
      paymentId: razorpay_payment_id,
      amount: slot.price,
      paymentStatus: 'completed',
      createdAt: new Date()
    };

    bookings.push(newBooking);

    // Update slot count
    slot.bookedCount += 1;

    console.log(`✅ Booking confirmed - Payment ID: ${razorpay_payment_id}`);

    res.json({
      message: "Booking confirmed successfully!",
      paymentId: razorpay_payment_id,
      bookingId: newBooking.id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// ==========================================
// OLD BOOKING ENDPOINT (Keep for backward compatibility)
// ==========================================
app.post("/api/bookings", async (req, res) => {
  const { slotId, name, phone, email, choreographer } = req.body;

  if (!slotId || !name || !phone || !choreographer) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find the slot
    const slot = slots.find((s) => s.id === slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check seat availability
    if (slot.bookedCount >= slot.maxSeats) {
      return res.status(400).json({ message: "This slot is already full." });
    }

    // Add booking
    const newBooking = {
      id: Date.now(),
      slotId,
      name,
      phone,
      email: email || "",
      choreographer,
      date: new Date(),
    };

    bookings.push(newBooking);

    // Increase slot booking count
    slot.bookedCount += 1;

    res.json({
      message: "Booking confirmed!",
      booking: newBooking,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET booking history by phone (optional - for user dashboard)
app.get('/api/bookings/:phone', (req, res) => {
  const phone = req.params.phone;
  
  const userBookings = bookings.filter(b => b.phone === phone);
  
  // Add slot details to bookings
  const bookingsWithSlots = userBookings.map(booking => {
    const slot = slots.find(s => s.id === booking.slotId);
    return {
      ...booking,
      slotDetails: slot ? {
        style: slot.style,
        day: slot.day,
        time: slot.time
      } : null
    };
  });
  
  res.json(bookingsWithSlots);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log('💳 Razorpay payment gateway ready');
});