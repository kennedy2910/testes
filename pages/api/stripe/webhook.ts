import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { buffer } from "micro"

export const config = {
  api: {
    bodyParser: false
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end("Method Not Allowed")
  }

  const sig = req.headers["stripe-signature"]
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" })
  }

  let event: Stripe.Event

  try {
    const rawBody = await buffer(req)

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).json({ error: "Webhook Error" })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const appSessionId = session.metadata?.session_id

      if (!appSessionId) {
        console.warn("Checkout completed without app session_id in metadata")
      } else {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sessions/mark_paid`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              session_id: Number(appSessionId),
              stripe_session_id: session.id
            })
          }
        )
      }
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    res.status(500).json({ error: "Internal webhook handler error" })
  }
}
