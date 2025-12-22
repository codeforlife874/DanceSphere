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
  const API_BASE = "http://localhost:5000";

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // AOS INIT
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  // CHOREOGRAPHERS
  const choreographers = [
    {
      name: "Alexander Noel",
      style: "Bollywood • Semi-Classical",
      img: choreo1,
      bio: "Alexander Noel is a versatile Bollywood and semi-classical choreographer with 6+ years of experience."
    },
    {
      name: "Sagar Chand",
      style: "Contemporary • Western",
      img: choreo2,
      bio: "Sagar is known for emotional contemporary fusion with strong lines and technique."
    },
    {
      name: "Prakhar Saini",
      style: "Hip-Hop • Urban Choreo",
      img: choreo3,
      bio: "Prakhar brings energetic hip-hop, isolations, grooves, and urban choreography."
    }
  ];

  // LOAD SLOTS
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/slots`);
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        console.error("Error loading slots:", err);
      }
      setLoading(false);
    };

    fetchSlots();
  }, []);

  // FORM INPUT HANDLER
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SUBMIT BOOKING - Shows Payment Gateway
  const submitBooking = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validation
    if (!formData.name || !formData.phone || !chosenChoreo) {
      setMsg("❌ Please fill all required fields");
      return;
    }

    // Show payment gateway
    setShowPaymentGateway(true);
  };

  // HANDLE PAYMENT METHOD SELECTION
  const handlePaymentMethod = async (method) => {
    setSelectedPaymentMethod(method);
    setPaymentProcessing(true);

    // Simulate payment processing (2 seconds)
    setTimeout(async () => {
      try {
        // Make the actual booking
        const response = await fetch(`${API_BASE}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotId: selectedSlot.id,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            choreographer: chosenChoreo,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setPaymentProcessing(false);
          setShowPaymentGateway(false);
          setMsg("❌ " + data.message);
        } else {
          // Show success
          setPaymentProcessing(false);
          setPaymentSuccess(true);

          // Refresh slots
          const updated = await fetch(`${API_BASE}/api/slots`);
          setSlots(await updated.json());

          // Reset and close after showing success
          setTimeout(() => {
            setShowPaymentGateway(false);
            setPaymentSuccess(false);
            setSelectedPaymentMethod('');
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

            <button className="close-bio" onClick={() => setSelectedChoreo(null)}>
              Close
            </button>
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
            document.querySelector('.slots-section').scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }}
        >
          Explore Slots
        </button>
      </header>

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

      {/* GALLERY SECTION */}
      <section className="gallery-section" data-aos="fade-up">
        <h2 className="section-title">Studio Moments</h2>

        <div className="gallery-grid">
          <img src={g1} alt="gallery" />
          <img src={g2} alt="gallery" />
          <img src={g3} alt="gallery" />
          <img src={g4} alt="gallery" />
          <img src={g5} alt="gallery" />
          <img src={g6} alt="gallery" />
          <img src={g7} alt="gallery" />
          <img src={g8} alt="gallery" />
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

      {/* BOOKING POPUP */}
      {selectedSlot && (
        <div className="popup">
          <div className="popup-content">
            <h2>Book: {selectedSlot.style} ({selectedSlot.day})</h2>
            <p style={{color: '#dcbdff', fontSize: '14px', marginTop: '5px'}}>
              💳 Secure payment gateway
            </p>

            <form onSubmit={submitBooking}>
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email (optional)" 
                value={formData.email} 
                onChange={handleChange} 
              />

              <select
                className="dropdown"
                value={chosenChoreo}
                onChange={(e) => setChosenChoreo(e.target.value)}
                required
              >
                <option value="">Select Choreographer</option>
                {choreographers.map((c, i) => (
                  <option key={i} value={c.name}>
                    {c.name} – {c.style}
                  </option>
                ))}
              </select>

              <button type="submit" className="slot-btn">
                Proceed to Payment
              </button>
            </form>

            {msg && <p className="msg" style={{marginTop: '15px', fontWeight: '600'}}>{msg}</p>}

            <button className="close-btn" onClick={() => {
              setSelectedSlot(null);
              setMsg("");
            }}>Close</button>
          </div>
        </div>
      )}

      {/* REALISTIC PAYMENT GATEWAY */}
      {showPaymentGateway && (
        <div className="payment-overlay">
          <div className="payment-modal">
            
            {/* Header */}
            <div className="payment-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h2>Dance Sphere</h2>
                <p>Secure Payment Gateway</p>
              </div>
              {!paymentProcessing && !paymentSuccess && (
                <button 
                  className="payment-close"
                  onClick={() => {
                    setShowPaymentGateway(false);
                    setMsg("Payment cancelled");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Body */}
            <div className="payment-body">
              
              {/* Success Screen */}
              {paymentSuccess ? (
                <div className="payment-success">
                  <div className="success-icon">✓</div>
                  <h3 className="success-title">Payment Successful!</h3>
                  <p className="success-subtitle">Booking confirmed 🎉</p>
                  <p className="transaction-id">Transaction ID: TXN{Date.now()}</p>
                </div>
              ) : paymentProcessing ? (
                /* Processing Screen */
                <div className="payment-processing">
                  <div className="spinner"></div>
                  <h3 className="processing-title">Processing Payment...</h3>
                  <p className="processing-subtitle">Please wait</p>
                  <p className="processing-method">Connecting to {selectedPaymentMethod}</p>
                </div>
              ) : (
                /* Payment Methods */
                <>
                  {/* Order Summary */}
                  <div className="order-summary">
                    <div className="order-summary-row">
                      <span className="order-slot-name">{selectedSlot.style}</span>
                      <span className="order-price">₹{selectedSlot.price}</span>
                    </div>
                    <p className="order-details">{selectedSlot.day} • {selectedSlot.time}</p>
                  </div>

                  <h3 className="payment-methods-title">Choose Payment Method</h3>

                  {/* Google Pay */}
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePaymentMethod('Google Pay')}
                  >
                    <div className="payment-method-content">
                      <div className="payment-icon gpay">G</div>
                      <div className="payment-method-info">
                        <h4>Google Pay</h4>
                        <p>UPI Payment</p>
                      </div>
                    </div>
                    <span className="payment-arrow">›</span>
                  </button>

                  {/* PhonePe */}
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePaymentMethod('PhonePe')}
                  >
                    <div className="payment-method-content">
                      <div className="payment-icon phonepe">P</div>
                      <div className="payment-method-info">
                        <h4>PhonePe</h4>
                        <p>UPI Payment</p>
                      </div>
                    </div>
                    <span className="payment-arrow">›</span>
                  </button>

                  {/* Paytm */}
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePaymentMethod('Paytm')}
                  >
                    <div className="payment-method-content">
                      <div className="payment-icon paytm">₹</div>
                      <div className="payment-method-info">
                        <h4>Paytm</h4>
                        <p>UPI & Wallet</p>
                      </div>
                    </div>
                    <span className="payment-arrow">›</span>
                  </button>

                  {/* Cards */}
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePaymentMethod('Credit/Debit Card')}
                  >
                    <div className="payment-method-content">
                      <div className="payment-icon card">💳</div>
                      <div className="payment-method-info">
                        <h4>Credit/Debit Card</h4>
                        <p>Visa, Mastercard, Rupay</p>
                      </div>
                    </div>
                    <span className="payment-arrow">›</span>
                  </button>

                  {/* Net Banking */}
                  <button 
                    className="payment-method-btn"
                    onClick={() => handlePaymentMethod('Net Banking')}
                  >
                    <div className="payment-method-content">
                      <div className="payment-icon netbanking">🏦</div>
                      <div className="payment-method-info">
                        <h4>Net Banking</h4>
                        <p>All Banks</p>
                      </div>
                    </div>
                    <span className="payment-arrow">›</span>
                  </button>

                  {/* Secure Badge */}
                  <div className="secure-badge">
                    <span className="secure-icon">🔒</span>
                    <span>Secured by 256-bit encryption</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;