import "./GlassButton.css"

export default function GlassButton({ children, onClick, className = "" }) {
    return (
        <div className={`glass-button-component ${className}`}>
            <div className="button-wrap">
                <button onClick={onClick}>
                    <span>{children}</span>
                </button>
                <div className="button-shadow"></div>
            </div>
        </div>
    )
}