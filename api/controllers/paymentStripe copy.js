
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51OtF7S01rw9U6daMzSt8PEsZeIxIMQlA0V3rxqLNYCAoTfkgxtr9IdnDomd1xjTqlS4e1LonhJarsGhaY6IIcqSB00areY2QuE');

exports.createSession = async (req, res) => {
  try {
    const { totalneto, tipoEntrega, dateselect, productos, datoscliente, instruction, success_url, cancel_url } = req.body;

    const line_items = productos.map(producto => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: producto.name,
          images: producto.image
        },
        unit_amount: producto.precio * 100,
      },
      quantity: producto.cantidad,
    }));
    const customerName = datoscliente.name + " " + datoscliente.paternalLastname + " " + datoscliente.maternalLastname; // Concatenar nombre completo

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "payment",
      line_items,
      customer_email: datoscliente.email, // Usar customer_email en lugar de customer
      success_url, // Incluir la URL de éxito
      cancel_url,
      metadata: {
        tipoEntrega,
        dateselect,
        instruction,
        empresa: "Austins" // Agregar el nombre de tu empresa al objeto metadata
      },
    });

    console.log(session);
    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
