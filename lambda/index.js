const Alexa = require('ask-sdk-core');
const axios = require('axios');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '¡Bienvenido a Autins Huejutla! Puedes iniciar sesión diciendo "Inicia sesión". ¿Cómo puedo ayudarte hoy?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoginIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LoginIntent';
    },
    async handle(handlerInput) {
        const { name, phone } = handlerInput.requestEnvelope.request.intent.slots;
        const userName = name.value;
        const userPhone = phone.value;

        try {
            const response = await axios.post('https://austin-b.onrender.com/alexa/sign-in', {
                name: userName,
                phone: userPhone
            });

            const userData = response.data.user;

            if (userData) {
                const speakOutput = `He registrado tu nombre como ${userData.name}  ${userData.maternalLastname} y tu número de teléfono como ${userData.phone}. Has iniciado sesión exitosamente. ¿Cómo puedo asistirte hoy?`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                throw new Error('No se pudo obtener la información del usuario.');
            }
        } catch (error) {
            console.error(`Error al iniciar sesión: ${error.message}`);
            const speakOutput = 'No pude registrar tu información. Por favor, proporciona tu nombre y número de teléfono nuevamente.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const WelcomeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WelcomeIntent';
    },
    handle(handlerInput) {
        const speakOutput = '¡Puedes iniciar sesión diciendo "Inicia sesión". ¿Cómo puedo ayudarte hoy?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ListProductsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListProductsIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Lo siento, no pude obtener la lista de productos en este momento. Por favor intenta nuevamente más tarde.';

        try {
            const response = await axios.get('https://austin-b.onrender.com/product');
            const products = response.data; // Asumiendo que la respuesta de la API es un array de productos

            if (products.length > 0) {
                const productNames = products.map(product => product.name).join(', ');
                speakOutput = `Estos son los productos disponibles: ${productNames}. ¿Cuál te interesa?`;
            } else {
                speakOutput = 'No hay productos disponibles en este momento.';
            }
        } catch (error) {
            console.log(`Error al obtener productos: ${error}`);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('¿Cuál producto te interesa?')
            .getResponse();
    }
};

const SelectProductIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectProductIntent';
    },
    handle(handlerInput) {
        const { product } = handlerInput.requestEnvelope.request.intent.slots;
        const selectedProduct = product.value;

        if (selectedProduct) {
            const speakOutput = `Has seleccionado ${selectedProduct}. ¿Quieres confirmar la compra?`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Quieres confirmar la compra de ' + selectedProduct + '?')
                .getResponse();
        } else {
            const speakOutput = 'No pude identificar el producto que seleccionaste. Por favor, intenta nuevamente.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Qué producto quieres seleccionar?')
                .getResponse();
        }
    }
};

const ConfirmPurchaseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfirmPurchaseIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Compra confirmada. Gracias por tu compra. ¿Puedo ayudarte en algo más?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('¿Puedo ayudarte en algo más?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes decirme "Hola" o "Inicia sesión". ¿Cómo puedo ayudarte?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = '¡Adiós!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no entiendo esa solicitud. Por favor intenta nuevamente.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Sesión terminada: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Acabas de activar ${intentName}`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, tuve problemas para hacer lo que pediste. Por favor intenta nuevamente.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        LoginIntentHandler,
        ListProductsIntentHandler,
        SelectProductIntentHandler,
        ConfirmPurchaseIntentHandler,
        WelcomeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/autins-huejutla/v1.0')
    .lambda();
