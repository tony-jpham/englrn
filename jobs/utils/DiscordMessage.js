const sendDiscordMessage = async (messageContent) => {
    try {
        const response = await fetch(process.env.DISCORD_HOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: messageContent,
                username: "EngLrn", // Optional: customize the sender name
                avatar_url: process.env.ENG_LRN_AVATAR_URL, // Optional: customize the sender avatar
                flags: 4
                // You can also add embeds or other options here
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message to Discord. Status code: ${response.status}`);
        }

        console.log('Message sent successfully:', response.status);
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
};

module.exports = { sendDiscordMessage };