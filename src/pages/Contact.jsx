function Contact() {
    return (
        <div className="contact-page">

            <div className="contact-header">
                <p className="small-title">Get in Touch</p>

                <h1>Contact BlockFund AI</h1>

                <p>
                    We'd love to hear from you. Feel free to contact us for
                    project information, technical support, or collaboration.
                </p>
            </div>

            <div className="contact-grid">

                <div className="contact-info">

                    <h2>Contact Information</h2>

                    <div className="contact-item">
                        <h3>📍 Address</h3>
                        <p>Bangalore, Karnataka, India</p>
                    </div>

                    <div className="contact-item">
                        <h3>📧 Email</h3>
                        <p>support@blockfundai.com</p>
                    </div>

                    <div className="contact-item">
                        <h3>📞 Phone</h3>
                        <p>+91 9876543210</p>
                    </div>

                    <div className="contact-item">
                        <h3>🌐 Website</h3>
                        <p>www.blockfundai.com</p>
                    </div>

                </div>

                <div className="contact-form-box">

                    <h2>Send Message</h2>

                    <form>

                        <input
                            type="text"
                            placeholder="Your Name"
                        />

                        <input
                            type="email"
                            placeholder="Your Email"
                        />

                        <input
                            type="text"
                            placeholder="Subject"
                        />

                        <textarea
                            rows="6"
                            placeholder="Write your message..."
                        ></textarea>

                        <button className="primary-btn">
                            Send Message
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Contact;