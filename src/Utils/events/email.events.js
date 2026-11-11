import { EventEmitter } from "events";
import { emailSubjects, sendEmail } from "../email/email.utils.js";

export const emailEvents = new EventEmitter();

emailEvents.on("ConfirmEmail", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubjects.CONFIRMATION,
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Route Academy!</h2>

      <p>
        Thank you for creating an account.
      </p>

      <p>
        Your verification OTP is:
      </p>

      <h1 style="letter-spacing: 5px;">
        ${data.otp}
      </h1>

      <p>
        Please use this OTP to verify your email address.
      </p>
    </div>
  `,
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});

emailEvents.on("forgetPassword", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubjects.PASSWORD_RESET,
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Route Academy!</h2>

      <p>
        Thank you for creating an account.
      </p>

      <p>
        Your verification OTP is:
      </p>

      <h1 style="letter-spacing: 5px;">
        ${data.otp}
      </h1>

      <p>
        Please use this OTP to verify your email address.
      </p>
    </div>
  `,
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});
