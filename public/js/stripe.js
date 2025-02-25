import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51QsekpIprj2A2yqR2ANjXGQixmvuvF1kxeXnttExCLqnLjMKK5yB1JC2saUlzxiIlViD0f6dcxzgJwkkDHzf86DN00Idgnt1mt'
);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const session = await axios.get(
      `/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }

  // Create checkout form + charge credit card
};
