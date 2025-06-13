import { type DialogProps } from "@radix-ui/react-dialog"

const FileDialog = ({ children, ...props }: DialogProps) => {
  return (
    props.open &&
    <div className="fixed inset-0 big-black bg-opacity-50 flex item-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-[120%] max-w-4xl relative">
        <button
          className="absolute top-2 right-2  text-black-1000"
          onClick={() => props.onOpenChange && props.onOpenChange(false)}
        >
          X
        </button>
        {children}
      </div>
    </div>
  )
}

export {
  FileDialog
}
