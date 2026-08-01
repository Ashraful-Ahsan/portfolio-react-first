import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const Contact = () => {
  const form = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    if (isSending) return;

    setIsSending(true);

    emailjs
      .sendForm(
        "service_lkd8p97",
        "template_29ei2ua",
        form.current,
        "mxdXsyFxlcY6-7F-0"
      )
      .then(
        () => {
          setIsSending(false);
          form.current.reset();
          toast.success("Message sent successfully! ✅", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });
        },
        (error) => {
          console.error("Error sending message:", error);
          setIsSending(false);
          toast.error("Failed to send message. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });
        }
      );
  };

  return (
    <section id="contact" className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
      <ToastContainer />

      <div className="text-center">
        <h2 className="section-title">Contact</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
        <p className="section-subtitle">
          I’d love to hear from you — whether it’s for a project, collaboration, or a quick conversation.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-2xl font-semibold text-white">Let’s build something great</h3>
          <p className="mt-4 text-slate-400">
            I’m available for freelance work, full-time opportunities, and thoughtful collaborations.
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2 text-purple-300"><FaEnvelope /></div>
              <span>ashrafulahsan.dev@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2 text-purple-300"><FaPhoneAlt /></div>
              <span>+880 1700-000000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2 text-purple-300"><FaMapMarkerAlt /></div>
              <span>Sirajganj, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <form ref={form} onSubmit={sendEmail} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" name="user_name" placeholder="Your Name" required className="w-full rounded-2xl border border-white/10 bg-[#131025] px-4 py-3 text-white outline-none transition focus:border-purple-500" />
              <input type="email" name="user_email" placeholder="Your Email" required className="w-full rounded-2xl border border-white/10 bg-[#131025] px-4 py-3 text-white outline-none transition focus:border-purple-500" />
            </div>
            <input type="text" name="subject" placeholder="Subject" required className="w-full rounded-2xl border border-white/10 bg-[#131025] px-4 py-3 text-white outline-none transition focus:border-purple-500" />
            <textarea name="message" rows="5" placeholder="Message" required className="w-full rounded-2xl border border-white/10 bg-[#131025] px-4 py-3 text-white outline-none transition focus:border-purple-500" />
            <button type="submit" disabled={isSending} className={`w-full rounded-2xl px-4 py-3 font-semibold text-white transition ${isSending ? "cursor-not-allowed bg-slate-600" : "btn-primary"}`}>
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
