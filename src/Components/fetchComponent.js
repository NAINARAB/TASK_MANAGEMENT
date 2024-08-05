import api from "../API";

export const fetchLink = async ({
    address,
    method = 'GET',
    headers = { 'Content-Type': 'application/json' },
    bodyData = null,
    others = {}
}) => {
    const othersOption = (method === 'POST' || method === 'PUT' || method === 'DELETE') ? {
        body: JSON.stringify(bodyData || {}),
        ...others
    } : others ? { ...others } : {};

    try {
        const response = await fetch(api + address, {
            method,
            headers,
            ...othersOption
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (e) {
        console.error('Fetch Error', e);
        throw e;
    }
};
