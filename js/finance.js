async function getExchangeRate() {
    try {
        // Usando una API gratuita de tipos de cambio
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        const dopRate = data.rates.DOP;
        return dopRate;
    } catch (e) {
        console.error("Error fetching exchange rate:", e);
        return 59; // Valor de respaldo aproximado
    }
}

async function calculateTotalUSD(targetDOP) {
    const dopRate = await getExchangeRate();
    const baseUSD = targetDOP / dopRate;

    // PayPal cobra aprox 5.4% + $0.30 USD por transacción internacional
    // Para recibir exactamente 'baseUSD', la fórmula es: (baseUSD + 0.30) / (1 - 0.054)
    const totalUSD = (baseUSD + 0.30) / (1 - 0.054);

    return {
        rate: dopRate,
        baseUSD: baseUSD.toFixed(2),
        totalUSD: totalUSD.toFixed(2)
    };
}
