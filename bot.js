const { Client, GatewayIntentBits, ActivityType, SlashCommandBuilder, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
require('dotenv').config();

const botToken = process.env.TOKEN;

// Shutdown notification configuration
const SHUTDOWN_USER_ID = '802937980897067059';
const SHUTDOWN_CHANNEL_ID = '1443326831527858216';

// Check if token exists
if (!botToken) {
    console.log("ERROR: Bot token not found in environment variables!");
    process.exit(1);
}

// Create client with intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

// Collections to store commands
client.commands = new Collection(); // Slash commands
client.prefixCommands = new Collection(); // Prefix commands

// Load modal handlers
const modalHandlers = new Map();

// Load button handlers
let buttonHandlers = {};

// Load modules
let linkFilterModule;
let commandLoggerModule;
let ticketHandler;
let auditLogger;
let purchaseMonitor;
let nukeProtection;

// Shutdown notification function
/*async function sendShutdownNotification(reason) {
    try {
        if (!client.isReady()) {
            console.log('⚠️ Client not ready, cannot send shutdown notification');
            return;
        }

        const channel = await client.channels.fetch(SHUTDOWN_CHANNEL_ID);
        if (!channel) {
            console.log('⚠️ Could not find shutdown notification channel');
            return;
        }

        const message = `<@${SHUTDOWN_USER_ID}> 🔴 **West Virginia Roleplay Utils: Bot Shutdown**\n\`\`\`\n${reason}\n\`\`\``;
        await channel.send(message);
        console.log('✅ Shutdown notification sent');
    } catch (error) {
        console.log('❌ Failed to send shutdown notification:', error);
    }
}*/

// Graceful shutdown handler
async function handleShutdown(reason) {
    console.log(`\n🛑 Shutting down: ${reason}`);
    
    // await sendShutdownNotification(reason);
    
    // Give time for the message to send
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Destroy client and exit
    client.destroy();
    process.exit(0);
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    handleShutdown('SIGINT');
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    handleShutdown('SIGTERM');
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error);
    await handleShutdown(`Uncaught Exception: ${error.message}\n${error.stack}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    await handleShutdown(`Unhandled Rejection: ${error.message || error}\n${error.stack || ''}`);
});

async function loadModules() {
    try {
        console.log('✅ Modules loaded successfully');
    } catch (error) {
        console.log('❌ Failed to load modules:', error);
    }
}

// Load prefix command files from commands directory
async function loadPrefixCommands() {
    const commandsPath = path.join(__dirname, 'commands', 'prefix');
    
    try {
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)];
                
                try {
                    const command = require(filePath);
                    
                    if (!command.name) {
                        console.warn(`⚠️ Prefix command at ${file} is missing a name property`);
                        continue;
                    }
                    
                    if (typeof command.execute !== 'function') {
                        console.warn(`⚠️ Prefix command ${command.name} at ${file} is missing an execute function`);
                        continue;
                    }
                    
                    client.prefixCommands.set(command.name, command);
                    
                    // Also load aliases if they exist
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            client.prefixCommands.set(alias, command);
                        });
                        console.log(`✅ Loaded prefix command: ${command.name} (aliases: ${command.aliases.join(', ')})`);
                    } else {
                        console.log(`✅ Loaded prefix command: ${command.name}`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to load prefix command ${file}: ${error.message}`);
                }
            }
            console.log(`✅ All prefix commands loaded from ./commands/prefix`);
        } else {
            console.log(`⚠️ Commands directory does not exist at ${commandsPath}`);
        }
    } catch (error) {
        console.log(`❌ Failed to load prefix commands: ${error}`);
    }
}

async function loadButtonHandlers() {
    // Load from both handlers and modules directories
    const directories = [
        path.join(__dirname, 'modules')
    ];
    
    for (const handlersPath of directories) {
        try {
            if (fs.existsSync(handlersPath)) {
                const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
                
                for (const file of handlerFiles) {
                    const filePath = path.join(handlersPath, file);
                    delete require.cache[require.resolve(filePath)];
                    
                    try {
                        const handler = require(filePath);
                        
                        // Store button handler functions
                        if (handler.handleGbanButtons) {
                            buttonHandlers.handleGbanButtons = handler.handleGbanButtons;
                            console.log(`✅ Gban button handler loaded from ${file}`);
                        }
                        
                        // Store strike handler functions
                        if (handler.handleStrikeButtons) {
                            buttonHandlers.handleStrikeButtons = handler.handleStrikeButtons;
                            console.log(`✅ Strike button handler loaded from ${file}`);
                        }
                        
                        if (handler.handleStrikeEditModal) {
                            buttonHandlers.handleStrikeEditModal = handler.handleStrikeEditModal;
                            console.log(`✅ Strike edit modal handler loaded from ${file}`);
                        }
                    } catch (error) {
                        console.log(`❌ Failed to load handler ${file}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Failed to load button handlers from ${handlersPath}: ${error}`);
        }
    }
}

// Load modal handler files
async function loadModalHandlers() {
    // Load from both handlers and modules directories
    const directories = [
        path.join(__dirname, 'modules')
    ];
    
    for (const handlersPath of directories) {
        try {
            if (fs.existsSync(handlersPath)) {
                const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
                
                for (const file of handlerFiles) {
                    const filePath = path.join(handlersPath, file);
                    delete require.cache[require.resolve(filePath)];
                    
                    try {
                        const handler = require(filePath);
                        
                        // Store handler functions
                        if (handler.handlePartnershipModal) {
                            modalHandlers.set('partnership_modal', handler.handlePartnershipModal);
                            console.log(`✅ Modal handler loaded from ${file}`);
                        }
                    } catch (error) {
                        console.log(`❌ Failed to load handler ${file}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Failed to load modal handlers from ${handlersPath}: ${error}`);
        }
    }
}

// Load slash command files from slashcommands directory
async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands', 'slash');
    
    try {
        // Check if commands directory exists
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                
                // Clear require cache to allow hot reloading
                delete require.cache[require.resolve(filePath)];
                
                try {
                    const command = require(filePath);
                    
                    if ('data' in command && 'execute' in command) {
                        // Handle both single commands and arrays of commands
                        if (Array.isArray(command.data)) {
                            // Store the entire command object with array of data
                            const fileName = file.replace('.js', '');
                            client.commands.set(fileName, command);
                            console.log(`✅ Multi-command file ${fileName} loaded with ${command.data.length} commands from ${file}`);
                        } else {
                            // Single command
                            client.commands.set(command.data.name, command);
                            console.log(`✅ Slash command ${command.data.name} loaded from ${file}`);
                        }
                    } else {
                        console.log(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to load slash command ${file}: ${error.message}`);
                    // Continue loading other commands even if one fails
                }
            }
            console.log(`✅ All slash commands loaded successfully.`);
        } else {
            console.log(`⚠️ Slash commands directory does not exist, creating it...`);
            fs.mkdirSync(commandsPath, { recursive: true });
            console.log(`✅ Slash commands directory created at ${commandsPath}`);
        }
    } catch (error) {
        console.log(`❌ Failed to load slash commands: ${error}`);
    }
}

// Improved command sync function that properly replaces all commands
async function syncCommands(rest) {
    const commands = [];
    
    // Convert commands to JSON
    client.commands.forEach((command, key) => {
        if (Array.isArray(command.data)) {
            command.data.forEach(cmdData => {
                if (cmdData && typeof cmdData.toJSON === 'function') {
                    commands.push(cmdData.toJSON());
                }
            });
        } else {
            if (command.data && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
            }
        }
    });
    
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
    
    // This PUT request will REPLACE all existing commands with the new ones
    // effectively removing any old commands that are no longer in your files
    const data = await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
    );
    
    console.log(`✅ Successfully synced ${data.length} command(s). Old commands have been removed.`);
    return data;
}

client.once('ready', async () => {
    // Set bot activity
    client.user.setActivity('Managing West Virginia', { type: ActivityType.Watching });
    client.user.setStatus('online');
    console.log(`🤖 Logged in as ${client.user.tag}`);
    
    // Initialize global vote storage
    global.playerVotes = global.playerVotes || new Map();
    global.staffVotes = global.staffVotes || new Map();
    
    // Load commands and handlers
    console.log('📦 Loading bot components...');
    await loadCommands(); // Slash commands
    await loadPrefixCommands(); // Prefix commands
    await loadModalHandlers();
    await loadButtonHandlers();
    await loadModules(); // Load modules (including ticket handler)
    console.log('✅ All components loaded');
    
    // Sync slash commands
    try {
        const rest = new REST({ version: '10' }).setToken(botToken);
        await syncCommands(rest);
    } catch (error) {
        console.log(`❌ Failed to sync commands: ${error}`);
    }
});

// Handle slash command and context menu interactions
client.on('interactionCreate', async interaction => {
    // Handle button interactions
    if (interaction.isButton()) {
        console.log('🔘 Button interaction received:', interaction.customId);
        
        try {
            // Handle verification button
            const verificationSystem = require('./modules/verificationSystem');
            const verifyHandled = await verificationSystem.handleVerifyButton(interaction);
            if (verifyHandled) return;
            // Handle moderations pagination buttons
            if (interaction.customId.startsWith('moderations_')) {
                // Let the collector in the moderations command handle this
                return;
            }
            
            // Try ticket button handler FIRST
            if (ticketHandler && ticketHandler.handleTicketButtons) {
                console.log('🎫 Trying ticket button handler...');
                const handled = await ticketHandler.handleTicketButtons(interaction);
                console.log('Ticket handler result:', handled);
                if (handled) return;
            }
            
            // Try vote button handlers from PREFIX commands
            const staffVoteCmd = client.prefixCommands.get('staffvote');
            if (staffVoteCmd && staffVoteCmd.handleButton) {
                const handled = await staffVoteCmd.handleButton(interaction);
                if (handled) return;
            }
            
            const playerVoteCmd = client.prefixCommands.get('playervote');
            if (playerVoteCmd && playerVoteCmd.handleButton) {
                const handled = await playerVoteCmd.handleButton(interaction);
                if (handled) return;
            }
            
            // Try vote button handlers from SLASH commands
            const staffVoteSlash = client.commands.get('staffvote');
            if (staffVoteSlash && staffVoteSlash.handleButton) {
                const handled = await staffVoteSlash.handleButton(interaction);
                if (handled) return;
            }
            
            const playerVoteSlash = client.commands.get('playervote');
            if (playerVoteSlash && playerVoteSlash.handleButton) {
                const handled = await playerVoteSlash.handleButton(interaction);
                if (handled) return;
            }
            
            // Try gban button handler
            if (buttonHandlers.handleGbanButtons) {
                console.log('🔨 Calling handleGbanButtons...');
                const handled = await buttonHandlers.handleGbanButtons(interaction);
                console.log('Handler result:', handled);
                if (handled) return;
            }
            
            // Try strike button handler
            if (buttonHandlers.handleStrikeButtons) {
                console.log('⚡ Calling handleStrikeButtons...');
                const handled = await buttonHandlers.handleStrikeButtons(interaction);
                console.log('Handler result:', handled);
                if (handled) return;
            }
            
            // If no handler processed the button, log it
            console.log(`⚠️ Unhandled button interaction: ${interaction.customId}`);
            
        } catch (error) {
            console.error('❌ Error handling button interaction:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'There was an error processing your request!',
                    ephemeral: true
                }).catch(console.error);
            }
        }
        return;
    }
    
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
        try {
            // Try ticket modal handler FIRST
            if (ticketHandler && ticketHandler.handleTicketModal) {
                console.log('🎫 Trying ticket modal handler...');
                const handled = await ticketHandler.handleTicketModal(interaction);
                console.log('Ticket modal handler result:', handled);
                if (handled) return;
            }
            
            const handler = modalHandlers.get(interaction.customId);
            if (handler) {
                await handler(interaction);
            } else {
                // Check for strike edit modal
                if (interaction.customId.startsWith('strike_edit_modal_')) {
                    if (buttonHandlers.handleStrikeEditModal) {
                        const handled = await buttonHandlers.handleStrikeEditModal(interaction);
                        if (handled) return;
                    }
                }
                
                console.log(`⚠️ Unhandled modal submission: ${interaction.customId}`);
            }
        } catch (error) {
            console.error('❌ Error handling modal submission:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'There was an error processing your submission!',
                    ephemeral: true
                }).catch(console.error);
            }
        }
        return;
    }
    
    // Handle slash commands and context menus
    if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) return;
    
    let command;
    
    // Find the appropriate command
    for (const [key, cmd] of client.commands) {
        if (Array.isArray(cmd.data)) {
            // Check if any command in the array matches
            const matchingCommand = cmd.data.find(cmdData => cmdData.name === interaction.commandName);
            if (matchingCommand) {
                command = cmd;
                break;
            }
        } else if (cmd.data.name === interaction.commandName) {
            command = cmd;
            break;
        }
    }
    
    if (!command) {
        console.error(`❌ No command matching ${interaction.commandName} was found.`);
        // If command not found locally, it might be an old command still on Discord
        await interaction.reply({
            content: 'This command is no longer available. Please use `>sync` to update commands.',
            ephemeral: true
        }).catch(console.error);
        return;
    }
    
    try {
        console.log(`⚡ Executing command: ${interaction.commandName}`);
        await command.execute(interaction);
        
        // Log successful command
        if (commandLoggerModule) {
            await commandLoggerModule.logSlashCommand(interaction, 'Successful');
        }
    } catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        
        // Log error in command logger
        if (commandLoggerModule) {
            const errorString = error.message || 'Unknown error';
            await commandLoggerModule.logSlashCommand(interaction, `Error: ${errorString}`);
        }
        
        const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        } catch (replyError) {
            console.error('❌ Failed to send error message:', replyError);
        }
    }
});

// Handle traditional prefix commands
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('>')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Handle prefix commands from ./commands folder
    const command = client.prefixCommands.get(commandName);
    
    if (!command) return; // Command not found, ignore
    
    try {
        console.log(`⚡ Executing prefix command: ${commandName}`);
        await command.execute(message, args, client);
        
        // Log successful command
        if (commandLoggerModule) {
            await commandLoggerModule.logPrefixCommand(message, commandName, args, 'Successful');
        }
    } catch (error) {
        console.error(`❌ Error executing prefix command ${commandName}:`, error);
        
        // Log error in command logger
        if (commandLoggerModule) {
            const errorString = error.message || 'Unknown error';
            await commandLoggerModule.logPrefixCommand(message, commandName, args, `Error: ${errorString}`);
        }
        
        message.reply('❌ There was an error executing that command!').catch(console.error);
    }
});

// Error handling
client.on('error', error => {
    console.log('❌ An error occurred:', error);
});

// Start the bot
try {
    client.login(botToken);
} catch (error) {
    if (error.code === 'TOKEN_INVALID') {
        console.log("❌ ERROR: Invalid bot token!");
    } else {
        console.log(`❌ ERROR: Failed to start bot: ${error}`);
    }
}