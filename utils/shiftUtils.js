const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const SHIFTS_FILE = path.join(__dirname, '../shifts.json');

// Initialize shifts file if it doesn't exist
if (!fs.existsSync(SHIFTS_FILE)) {
    fs.writeFileSync(SHIFTS_FILE, JSON.stringify({}));
}

function loadShifts() {
    return JSON.parse(fs.readFileSync(SHIFTS_FILE, 'utf8'));
}

function saveShifts(data) {
    fs.writeFileSync(SHIFTS_FILE, JSON.stringify(data, null, 2));
}

function createShiftButtons(userId, shifts) {
    const userData = shifts[userId] || { totalTime: 0, currentShift: null, currentBreak: null };
    const onShift = userData.currentShift;
    const onBreak = userData.currentBreak;
    
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shift_start')
                .setLabel('Start Shift')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!!onShift),
            new ButtonBuilder()
                .setCustomId('shift_break')
                .setLabel('Start Break')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!onShift || !!onBreak),
            new ButtonBuilder()
                .setCustomId('shift_stop')
                .setLabel('Stop Shift')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!onShift)
        );
    
    return row;
}

module.exports = {
    loadShifts,
    saveShifts,
    createShiftButtons
};