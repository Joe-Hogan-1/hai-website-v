import { useId } from "react"

export const Honeypot = () => {
  const id = useId()

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
      }}
    >
      {/* Bots often fill all fields, so we create fields that humans won't see or fill */}
      <label htmlFor={`name-${id}`}>Leave this field empty</label>
      <input type="text" id={`name-${id}`} name="bot_check_name" tabIndex={-1} autoComplete="off" />

      <label htmlFor={`email-${id}`}>Leave this field empty</label>
      <input type="email" id={`email-${id}`} name="bot_check_email" tabIndex={-1} autoComplete="off" />

      {/* Time-based check */}
      <input type="hidden" name="form_submission_time" value={Date.now().toString()} />
    </div>
  )
}

export const validateHoneypot = (formData: FormData): boolean => {
  // Check if honeypot fields are filled (they shouldn't be)
  const botCheckName = formData.get("bot_check_name") as string
  const botCheckEmail = formData.get("bot_check_email") as string

  if (botCheckName || botCheckEmail) {
    return false
  }

  // Check if the form was submitted too quickly (likely a bot)
  const submissionTime = Number.parseInt((formData.get("form_submission_time") as string) || "0")
  const timeDiff = Date.now() - submissionTime

  // If form was submitted in less than 3 seconds, likely a bot
  if (submissionTime > 0 && timeDiff < 3000) {
    return false
  }

  return true
}
