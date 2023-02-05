const SectionWrapper = ({title, children}) => {
    return (
        <div className="section-wrapper">
            <h1 className="section-title">{title}</h1>
            {children}
        </div>
    )
}

export default SectionWrapper