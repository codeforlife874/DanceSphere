import choreo1 from "./assets/choreo1.jpg";
import choreo2 from "./assets/choreo2.jpg";
import choreo3 from "./assets/choreo3.jpg";
import g1 from "./assets/g1.jpeg";
import g2 from "./assets/g2.jpeg";
import g3 from "./assets/g3.jpeg";
import g4 from "./assets/g4.jpeg";
import g5 from "./assets/g5.jpeg";
import g6 from "./assets/g6.jpeg";
import g7 from "./assets/g7.jpeg";
import g8 from "./assets/g8.jpeg";
import watermark from "./assets/watermark.jpeg";

import logo from "./assets/logo.png";

import { useEffect, useState } from "react";
import "./App.css";

import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  


  // ⭐ PHP BACKEND (changed)
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // STATES
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [msg, setMsg] = useState("");

  const [selectedChoreo, setSelectedChoreo] = useState(null);
  const [chosenChoreo, setChosenChoreo] = useState("");

  // PAYMENT GATEWAY STATES
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  // ⭐ FEEDBACK FORM STATES
  const [fbName, setFbName] = useState("");
  const [fbMsg, setFbMsg] = useState("");
  const [fbStatus, setFbStatus] = useState("");


  // AOS INIT
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/slots`);
        const data = await res.json();
        setSlots(data);
      } catch (err) {
        console.error("Slot load error:", err);
      }
      setLoading(false);
    };
    fetchSlots();
  }, []);

  // CHOREOGRAPHERS
  const choreographers = [
    {
      name: "Alexander Noel",
      style: "Bollywood • Semi-Classical",
      price:800,
      img: choreo1,
      bio: "Alexander Noel is a versatile Bollywood and semi-classical choreographer with 6+ years of experience."
    },
    {
      name: "Sagar Chand",
      style: "Contemporary • Western",
      price:900,
      img: choreo2,
      bio: "Sagar is known for emotional contemporary fusion with strong lines and technique."
    },
    {
      name: "Prakhar Saini",
      style: "Hip-Hop • Urban Choreo",
      price:700,
      img: choreo3,
      bio: "Prakhar brings energetic hip-hop, isolations, grooves, and urban choreography."
    }
    
  ];


  

  // FORM INPUT HANDLER
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SUBMIT BOOKING — show payment gateway
  const submitBooking = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!formData.name || !formData.phone || !chosenChoreo) {
      setMsg("❌ Please fill all required fields");
      return;
    }

    setShowPaymentGateway(true);
  };
 // ⭐ FEEDBACK SUBMIT → Save to feedback.json via Node backend
const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  setFbStatus("");

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST", // ✅ REQUIRED
      headers: {
        "Content-Type": "application/json" // ✅ REQUIRED
      },
      body: JSON.stringify({
        name: fbName,
        feedback: fbMsg
      })
    });

    const result = await res.json();

    if (result.status === "saved") {
      setFbStatus("✔ Feedback saved successfully");
      setFbName("");
      setFbMsg("");
    } else {
      setFbStatus("Something went wrong");
    }
  } catch (err) {
    console.error(err);
    setFbStatus("Server error");
  }
};



// ⭐ PAYMENT → SEND BOOKING TO NODE (JSON)
const handlePaymentMethod = async (method) => {
  setSelectedPaymentMethod(method);
  setPaymentProcessing(true);

  setTimeout(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          choreographer: chosenChoreo,
          paymentMethod: method
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPaymentProcessing(false);
        setShowPaymentGateway(false);
        setMsg("❌ " + (data.message || "Booking failed"));
      } else {
        // ✅ PAYMENT SUCCESS
        setPaymentProcessing(false);
        setPaymentSuccess(true);

        // 🔄 refresh slots from NODE
        const updated = await fetch(`${API_BASE}/api/slots`);
        setSlots(await updated.json());

        setTimeout(() => {
          setShowPaymentGateway(false);
          setPaymentSuccess(false);
          setSelectedPaymentMethod("");
          setSelectedSlot(null);
          setFormData({ name: "", phone: "", email: "" });
          setChosenChoreo("");
        }, 2500);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setPaymentProcessing(false);
      setShowPaymentGateway(false);
      setMsg("❌ Booking failed. Please try again.");
    }
  }, 2000);
};


  return (
    <div className="container">

      {/* BIO POPUP */}
      {selectedChoreo && (
        <div className="bio-popup">
          <div className="bio-content">
            <img src={selectedChoreo.img} className="bio-img" alt="" />
            <h2>{selectedChoreo.name}</h2>
            <h4>{selectedChoreo.style}</h4>
            <p>{selectedChoreo.bio}</p>
            <button className="close-bio" onClick={() => setSelectedChoreo(null)}>Close</button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <img src={logo} className="nav-logo" alt="logo" />
        <img src={watermark} className="nav-watermark" alt="" />
        <h1 className="logo-text">Dance Sphere</h1>
      </nav>

      {/* HERO */}
      <header className="hero" data-aos="fade-up">
        <h1 className="hero-title">Unleash Your Inner Dancer</h1>
        <p className="hero-sub">Bangalore's premium choreography studio</p>
        <p className="hero-sub2">Bollywood • Hip-Hop • Contemporary • Wedding Choreo</p>

        <button
          className="hero-btn"
          onClick={() => {
            document.querySelector(".slots-section").scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }}
        >
          Explore Slots
        </button>
      </header>

      {/* ABOUT + WHY + GALLERY + CHOREOGRAPHERS + SLOTS */}
      {/* ⭐ — All content below remains exactly the same as your file ⭐ */}

      {/* ABOUT SECTION */}
      <section className="about-section" data-aos="fade-up">
        <h2 className="section-title">About Dance Sphere</h2>
        <p className="about-text">
          Dance Sphere is Bangalore's most vibrant choreography studio, blending creativity,
          technique, and performance into an unforgettable experience.
        </p>
      </section>

      {/* WHY SECTION */}
      <section className="why-section" data-aos="fade-up">
        <h2 className="section-title">Why Choose Us?</h2>

        <div className="why-grid">
          <div className="why-card"><h3>Expert Choreographers</h3><p>Professionals with years of experience.</p></div>
          <div className="why-card"><h3>Beginner-Friendly</h3><p>Sessions designed for all levels.</p></div>
          <div className="why-card"><h3>Wedding Specialists</h3><p>Make your events unforgettable.</p></div>
          <div className="why-card"><h3>Premium Ambience</h3><p>Lights, energy & studio vibes.</p></div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery-section" data-aos="fade-up">
        <h2 className="section-title">Studio Moments</h2>

        <div className="gallery-grid">
          <img src={g1} alt="" /><img src={g2} alt="" /><img src={g3} alt="" /><img src={g4} alt="" />
          <img src={g5} alt="" /><img src={g6} alt="" /><img src={g7} alt="" /><img src={g8} alt="" />
        </div>
      </section>

      {/* SLOTS SECTION */}
      <section className="slots-section" data-aos="fade-up">
        <h2 className="section-title">Available Choreo Slots</h2>

        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <div className="slots-grid">
            {slots.map((slot) => {
              const seatsLeft = slot.maxSeats - slot.bookedCount;
              const full = seatsLeft <= 0;

              return (
                <div className="slot-card" key={slot.id}>
                  <h3>{slot.style}</h3>
                  <p><b>{slot.day}</b> – {slot.date}</p>
                  <p>{slot.time}</p>
                  <p>Level: {slot.level}</p>
                  <p>Price: ₹{slot.price}</p>

                  <p>
                    Seats Left:{" "}
                    <span className={full ? "full-text" : "left-text"}>
                      {full ? "Full" : seatsLeft}
                    </span>
                  </p>

                  <button
                    disabled={full}
                    className="slot-btn"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {full ? "Full" : "Book Slot"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CHOREOGRAPHERS */}
      <section className="choreo-section" data-aos="fade-up">
        <h2 className="section-title">Meet Our Choreographers</h2>

        <div className="choreo-grid">
          {choreographers.map((c, i) => (
            <div key={i} className="choreo-card" onClick={() => setSelectedChoreo(c)}>
              <img src={c.img} className="choreo-photo" alt="" />
              <h3>{c.name}</h3>
              <p>{c.style}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING POPUP + PAYMENT MODAL */}
      {/* ⭐ — Left untouched except backend calls ⭐ */}

      {selectedSlot && (
        <div className="popup">
          <div className="popup-content">
            <h2>Book: {selectedSlot.style} ({selectedSlot.day})</h2>

            <form onSubmit={submitBooking}>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email (optional)" />

              <select value={chosenChoreo} onChange={(e) => setChosenChoreo(e.target.value)} required>
                <option value="">Select Choreographer</option>
                {choreographers.map((c, i) => (
                  <option key={i} value={c.name}>{c.name} — {c.style}</option>
                ))}
              </select>

              <button type="submit" className="slot-btn">Proceed to Payment</button>
            </form>

            {msg && <p className="msg">{msg}</p>}

            <button className="close-btn" onClick={() => { setSelectedSlot(null); setMsg(""); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showPaymentGateway && (
  <div className="payment-overlay">
    <div className="payment-card">

      {/* Header */}
      <h2 className="pay-title">Complete Your Booking</h2>
      <p className="pay-sub">
        {selectedSlot.style} — {selectedSlot.day} • {selectedSlot.time}
      </p>

      {/* Order details */}
      <div className="pay-box">
        <p><b>Name:</b> {formData.name}</p>
        <p><b>Phone:</b> {formData.phone}</p>
        <p><b>Choreographer:</b> {chosenChoreo}</p>
        <p><b>Amount:</b> ₹{selectedSlot.price}</p>
      </div>

      {/* Payment states */}
      {paymentProcessing && (
        <div className="pay-processing">
          <div className="loader"></div>
          <p>Processing payment… please wait</p>
        </div>
      )}

      {paymentSuccess && (
        <div className="pay-success">
          <h3>🎉 Payment Successful</h3>
          <p>Your seat has been booked!</p>
        </div>
      )}

      {/* Choose payment */}
      {!paymentProcessing && !paymentSuccess && (
        <>
          <h4 className="choose-text">Choose Payment Method</h4>

          <div className="pay-buttons">

            <button
              className="pay-btn upi"
              onClick={() => handlePaymentMethod("upi")}
            >
              💜 Pay with UPI
            </button>

            <button
              className="pay-btn cash"
              onClick={() => handlePaymentMethod("cash")}
            >
              💵 Pay in Cash
            </button>

          </div>
        </>
      )}

      {/* Footer buttons */}
      {!paymentProcessing && !paymentSuccess && (
        <button
          className="cancel-btn"
          onClick={() => setShowPaymentGateway(false)}
        >
          Cancel
        </button>
      )}
    </div>
  </div>
)}


  {/* ⭐ FEEDBACK SECTION (Bottom of Page) */}
<section className="feedback-section" data-aos="fade-up" style={{ marginTop: "40px" }}>
  <h2 className="section-title">Give Your Feedback</h2>

  <form onSubmit={handleFeedbackSubmit} className="feedback-form">
  <input
    type="text"
    placeholder="Enter your name"
    value={fbName}
    onChange={(e) => setFbName(e.target.value)}
    required
  />

  <textarea
    placeholder="Write your feedback here..."
    value={fbMsg}
    onChange={(e) => setFbMsg(e.target.value)}
    required
  />

  <button type="submit" className="slot-btn">
    Submit Feedback
  </button>
</form>

{fbStatus && <p className="msg">{fbStatus}</p>}
</section>
    </div>
  );
}

export default App;
