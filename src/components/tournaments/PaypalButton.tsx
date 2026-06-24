'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { createClient } from '@/lib/supabase/client'

interface PaypalButtonProps {
  torneoId: string
  monto: number
  perfilId: string
}

export default function PaypalButton({ torneoId, monto, perfilId }: PaypalButtonProps) {
  const supabase = createClient()

  return (
    <PayPalScriptProvider options={{ "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: monto.toString(),
                },
                custom_id: `${torneoId}_${perfilId}`
              },
            ],
          })
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture()

            // Registrar participación
            await supabase.from('participantes').insert({
              torneo_id: torneoId,
              perfil_id: perfilId,
              metodo_pago: 'paypal',
              estado_pago: 'completado'
            })

            alert('¡Inscripción completada exitosamente!')
          }
        }}
      />
    </PayPalScriptProvider>
  )
}
