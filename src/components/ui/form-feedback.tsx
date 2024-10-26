import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cva, type VariantProps } from "class-variance-authority"

const feedbackVariants = cva(
  "rounded-lg p-4 mb-4",
  {
    variants: {
      variant: {
        success: "bg-green-50 text-green-700 border border-green-200",
        error: "bg-red-50 text-red-700 border border-red-200",
        warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      }
    },
    defaultVariants: {
      variant: "success"
    }
  }
)

interface FormFeedbackProps extends VariantProps<typeof feedbackVariants> {
  title: string
  message: string
}

export function FormFeedback({ title, message, variant }: FormFeedbackProps) {
  return (
    <Alert className={feedbackVariants({ variant })}>
      <div className="flex items-center gap-2">
        {variant === "success" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>{title}</AlertTitle>
      </div>
      <AlertDescription className="ml-6">
        {message}
      </AlertDescription>
    </Alert>
  )
}