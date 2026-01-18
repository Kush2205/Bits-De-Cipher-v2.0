

interface Props {
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    variant?: "small" | "medium" | "large"
    classname?: string
}

function Input(props: Props) {
    const { placeholder, value, onChange, variant , classname } = props
    return (
        <>
         <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className={`
                ${variant === "small" ? "p-2 text-lg  w-1/4" : ""}
                ${variant === "medium" ? "p-3 text-2xl w-1/3" : ""}
                ${variant === "large" ? "p-4 text-2xl w-1/2" : ""}
                border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${classname || ""}
            `}
        />
        </>
    )
}

export default Input
