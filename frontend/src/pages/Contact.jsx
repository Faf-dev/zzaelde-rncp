import "./Contact.css"
import Footer from "../composants/Footer/footer"
import ContactForm from "../composants/Formulaire/ContactForm"

export default function Home() {
  return (
    <div className="ContactPage">
      <ContactForm/>
      <div className="contact-footer">
        <Footer/>
      </div>
    </div>
  );
}
