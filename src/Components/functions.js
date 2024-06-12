
export const LocalDate = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const LocalDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const LocalTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export const getPreviousDate = (days) => {
    const num = days ? Number(days) : 1;
    return new Date(new Date().setDate(new Date().getDate() - num)).toISOString().split('T')[0]
}

export const firstDayOfMonth = () => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split('T')[0]
}

export const ISOString = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0]
}

export const timeDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = num => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const isEqualNumber = (a, b) => {
    return Number(a) === Number(b)
}

export const isGraterNumber = (a, b) => {
    return Number(a) > Number(b)
}

export const isGraterOrEqual = (a, b) => {
    return Number(a) >= Number(b)
}

export const isLesserNumber = (a, b) => {
    return Number(a) < Number(b)
}

export const isLesserOrEqual = (a, b) => {
    return Number(a) <= Number(b)
}

export const NumberFormat = (num) => {
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const Addition = (a, b) => {
    return Number(a) + Number(b)
}

export const Subraction = (a, b) => {
    return Number(a) - Number(b)
}

export const Multiplication = (a, b) => {
    return Number(a) * Number(b)
}

export const Division = (a, b) => {
    return Number(a) / Number(b)
}

export const numberToWords = (prop) => {
    const number = Number(prop)
    const singleDigits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', ' Thousand', ' Lakhs'];

    if (number < 10) {
        return singleDigits[number];
    } else if (number < 20) {
        return teens[number - 10];
    } else if (number < 100) {
        const tenDigit = Math.floor(number / 10);
        const singleDigit = number % 10;
        return tens[tenDigit] + (singleDigit !== 0 ? ' ' + singleDigits[singleDigit] : '');
    } else if (number < 1000) {
        const hundredDigit = Math.floor(number / 100);
        const remainingDigits = number % 100;
        return singleDigits[hundredDigit] + ' Hundred' + (remainingDigits !== 0 ? ' and ' + numberToWords(remainingDigits) : '');
    } else if (number < 100000) {
        const thousandDigit = Math.floor(number / 1000);
        const remainingDigits = number % 1000;
        return numberToWords(thousandDigit) + thousands[1] + (remainingDigits !== 0 ? ', ' + numberToWords(remainingDigits) : '');
    } else if (number < 10000000) {
        const lakhDigit = Math.floor(number / 100000);
        const remainingDigits = number % 100000;
        return numberToWords(lakhDigit) + thousands[2] + (remainingDigits !== 0 ? ', ' + numberToWords(remainingDigits) : '');
    } else {
        return 'Number is too large';
    }
}

export const isValidObject = (obj) => {
    return Object.keys(obj).length !== 0;
}
