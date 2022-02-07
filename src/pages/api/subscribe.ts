/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { query as q } from "faunadb"

import { stripe } from '../../services/stripe'
import { fauna } from "../../services/fauna"

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })
    
    const user: User = await fauna.query(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email),
        )
      )
    )

    let faunaCustomerId = user.data.stripe_customer_id

    if (!faunaCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      })
  
      const stripeCustomerRefId = user.ref.id
  
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), stripeCustomerRefId),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      faunaCustomerId = stripeCustomer.id
    }


    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: faunaCustomerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1KOyn8LfLcb1fuM2QQqKqVNi',
          quantity: 1
        }
      ], 
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({
      sessionId: stripeCheckoutSession
    })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}