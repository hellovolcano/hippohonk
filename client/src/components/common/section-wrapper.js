const SectionWrapper = ({title, children, className}) => {
    return (
        <div className="section-wrapper">
            <h1 className={className ? "section-title " + className : "section-title"}>{title}</h1>
            {children}
        </div>
    )
}

export default SectionWrapper