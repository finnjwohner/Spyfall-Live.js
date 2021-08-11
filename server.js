locations = ['Aeroplane', 'Bank', 'Beach', 'Theatre', 'Casino', 'Cathedral',
'Circus Tent', 'Corporate Party', 'Crusader Army', 'Wellness Centre',
'Consulate', 'Hospital', 'Hotel', 'Army Base', 'Film Studio', 'Ocean Liner',
'Passenger Train', 'Pirate Ship', 'Polar Station', 'Police Station', 'Restaurant',
'School', 'Service Station', 'Space Station', 'Submarine', 'Supermarket', 'University',
'Funfair', 'Art Museum', 'Sweets Factory', 'Cat Show', 'Cemetary', 'Coal Mine',
'Construction Site', 'Petrol Station', 'Harbour Docks',
'Jail', 'Jazz Club', 'Library', 'Night Bar', 'Race Track',
'Retirement Home', 'Rock Concert', 'Sightseeing Bus', 'Stadium', 'Underground', 'The U.N.',
'Vineyard', 'Wedding', 'Zoo'];

roles = [['First Class Passenger', 'On-Board Security', 'Serviceman', 'Economy Class Passenger', 'Flight Attendant', 'Secondary Pilot', 'Captain'],
['Armoured Car Driver', 'Manager', 'Consultant', 'Customer', 'Robber', 'Security Guard', 'Clerk'],
['Beach Waitress', 'Kite Surfer', 'Lifeguard', 'Mugger', 'Beach Goer', 'Beach Photographer', 'Ice Cream Van Driver'],
['Coat Check Assistant', 'Prompter', 'Cash Assistant', 'Visitor', 'Director', 'Actor', 'Crewman'],
['Publiucan', 'Head Security Guard', 'Muscle', 'Manager', 'Hustler', 'Dealer', 'Gambler'],
['Priest', 'Beggar', 'Sinner', 'Parishioner', 'Tourist', 'Sponsor', 'Choir Singer'],
['Acrobat', 'Animal Trainer', 'Magician', 'Visitor', 'Fire Eater', 'Clown', 'Juggler'],
['Entertainer', 'Manager', 'Unexpected Guest', 'Owner', 'Secretary', 'Accountant', 'Delivery Boy'],
['Monk', 'Imprisoned Arab', 'Servant', 'Bishop', 'Squire', 'Archer', 'Knight'],
['Customer', 'Stylist', 'Masseuse', 'Manicurist', 'Make-Up Artist', 'Dermatologist', 'Cosmetologist'],
['Security Guard', 'Secretary', 'Consul', 'Government Official', 'Tourist', 'Refugee', 'Diplomat'],
['Nurse', 'Doctor', 'Anesthesiologist', 'Intern', 'Patient', 'Therapist', 'Surgeon'],
['Concierge', 'Security Guard', 'Manager', 'Lobby Boy', 'Customer', 'Publican', 'Porter'],
['Deserter', 'Commander', 'Field Doctor', 'Soldier', 'Sniper', 'Officer', 'Tank Engineer'],
['Stunt Man', 'Sound Engineer', 'Camera Man', 'Director', 'Costume Artist', 'Actor', 'Producer'],
['Wealthy Passenger', 'Cook', 'Captain', 'Barman', 'Musician', 'Waiter', 'Serviceman'],
['Repairman', 'Border Patrol', 'Train Attendant', 'Passenger', 'Restaurant Chef', 'Engineer', 'Stoker'],
['Cook', 'Seaman', 'Slave', 'Cannoneer', 'Bound Prisoner', 'Cabin Boy', 'Brave Captain'],
['Field Doctor', 'Geologist', 'Expedition Leader', 'Biologist', 'Radioman' ,'Hydrologist', 'Meteorologist'],
['Detective', 'Lawyer', 'Journalist', 'Criminalist', 'Archivist', 'Patrol Officer', 'Criminal'],
['Musician', 'Customer', 'Muscle', 'Hostess', 'Head Chef', 'Food Critic', 'Waiter'],
['P.E. Teacher', 'Student', 'Headmaster', 'Security Guard', 'Cleaner', 'Canteen Lady', 'Repairman'],
['Manager', 'Tyre Specialist', 'Biker', 'Car Owner', 'Car Wash Assistant', 'Electrician', 'Mechanic'],
['Engineer', 'Alien', 'Space Tourist', 'Pilot', 'Commander', 'Scientist', 'Doctor'],
['Cook', 'Commander', 'Sonar Technician' ,'Electronics Technician', 'Seaman', 'Radioman', 'Navigator'],
['Customer', 'Cash Assistant', 'Butcher', 'Cleaner', 'Security Guard', 'Food Sample Hostess', 'Shelf Stocker'],
['Graduate Student', 'Professor', 'Dean', 'Psychologist', 'Repairman', 'Student', 'Cleaner'],
['Ride Operator', 'Parent', 'Food Salesperson', 'Cash Assistant', 'Happy Child', 'Annoying Child', 'Teenager'],
['Ticket Salesman', 'Student', 'Visitor', 'Teacher', 'Security Guard', 'Painter', 'Art Collector'],
['Pastry Chef', 'Visitor', 'Taster', 'Truffle Maker', 'Taster', 'Supply Worker', 'Oompa Loompa'],
['Judge', 'Cat-Handler', 'Animal Doctor', 'Security Guard', 'Cat Trainer', 'Crazy Cat Lady', 'Animal Lover'],
['Priest', 'Goth Girl', 'Grave Robber', 'Poet', 'Mourner', 'Gate Keeper', 'Deceased Person'],
['Safety Inspector', 'Miner', 'Supervisor', 'Garbage Truck Assistant', 'Driller', 'Coordinator', 'Blasting Enginner'],
['Free Roaming Toddler', 'Contractor', 'Crane Driver', 'Trespasser', 'Safety Officer', 'Electrician', 'Enginner'],
['Car Enthusiast', 'Service Attendant', 'Shopkeep', 'Customer', 'Car Washer', 'Cash Assistant', 'Customer'],
['Dock Loader', 'Salty Old Pirate', 'Captain', 'Seaman', 'Smuggler', 'Fisherman', 'Exporter'],
['Wrongly Accused Man', 'CCTV Operator', 'Guard', 'Visitor', 'Lawyer', 'Cleaner', 'Warden'],
['Muscle', 'Drummer', 'Pianist', 'Saxophonist', 'Singer', 'Jazz Fanatic', 'Dancer'],
['Elderly Man', 'Journalist', 'Author', 'Volunteer', 'Know It All', 'Student', 'Librarian'],
['Regular Patron', 'Publican', 'Security Guard', 'Dancer', 'Courtesan', 'Party Girl', 'Model'],
['Team Owner', 'Racer', 'Engineer', 'Spectator', 'Referee', 'Mechanic', 'Food Salesperson'],
['Relative', 'Cribbage Player', 'Elderly Person', 'Nurse', 'Cleaner', 'Cook', 'Blind Person'],
['Dancer', 'Singer', 'Fan', 'Guitarist', 'Drummer', 'Roadie', 'Stage Diver'],
['Elderly Man', 'Lone Tourist', 'Driver', 'Annoying Child', 'Tourist', 'Tour Guide', 'Photographer'],
['Doctor', 'Streaker', 'Athlete', 'Commentator', 'Spectator', 'Security Guard', 'Referee'],
['Tourist', 'Train Driver', 'Ticket Inspector', 'Pregnant Lady', 'Pickpocket', 'Cleaner', 'Businessman'],
['Diplomat', 'Interpreter', 'Blowhard', 'Tourist', 'Napping Delegate', 'Journalist', 'Secretary Of State'],
['Gardener', 'Gourmet Guide', 'Winemaker', 'Exporter', 'Butler', 'Wine Taster', 'Sommelier'],
['Ring Bearer', 'Groom', 'Bride', 'Officiant', 'Photographer', 'Bridesmaid', 'Best Man'],
['Zookeeper', 'Visitor', 'Photographer', 'Child', 'Animal Doctor', 'Tourist', 'Food Salesperson']];

const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { RSA_PKCS1_PADDING } = require('constants');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

// Run when client connects
io.on('connection', socket => {
    let user = {
        id: undefined,
        username: undefined,
        room: undefined,
    };

    console.log(`New WebSocket Connection... SocketID ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`SocketID ${socket.id} (${user.username}) WebSocket Connection Closed`);
        if (rooms.get(user.room) == undefined) {return;}

        i = 0;
        room = rooms.get(user.room)
        room.users.forEach(user => {
            if (user.id == socket.id)
                room.users.splice(i, 1)
            i++;
        })
        rooms.set(user.room, room);

        if(rooms.get(user.room).users.length == 0) {
            rooms.delete(user.room);
            console.log(`Deleted Empty Room ${user.room}`);
        }
        else {
            io.to(user.room).emit('leftRoom', user);
        }
    });

    socket.on('joinRoom', userdata => {
        user = userdata;
        user.id = socket.id;
        user.room = joinRoom(user.room);

        if (rooms.get(user.room).users.length >= 8) {
            socket.emit('joinRoomFull');
            user.room = joinRoom(undefined);
        }

        socket.join(user.room);
        room = rooms.get(user.room);
        room.users.push(user);
        rooms.set(user.room, room);

        console.log(`SocketID ${socket.id} (${user.username}) Joined Room ${user.room}`);

        locs = [];
        while(locs.length < 24) {
            loc = locations[Math.floor(Math.random() * 50)];
            if (!locs.includes(loc))
                locs.push(loc);
        }

        socket.emit('joinRoomAccept', rooms.get(user.room).users, locs);

        socket.to(user.room).emit('joinedRoom', user);
    })

    socket.on('stopGame', () => {
        io.to(user.room).emit('stoppedGame');
    })

    socket.on('startGame', () => {
        console.log(`New Game Started With ${rooms.get(user.room).users.length}/8 players on Room ${user.room}`);
    
        locs = [];
        while(locs.length < 24) {
            loc = locations[Math.floor(Math.random() * 50)];
            if (!locs.includes(loc))
                locs.push(loc);
        }
    
        location = locations.indexOf(locs[Math.floor(Math.random() * 24)]);
    
        spy = Math.floor(Math.random() * rooms.get(user.room).users.length);
        
        rols = [];
        for(i = 0; i < rooms.get(user.room).users.length; i++) {
            if (i == spy) {
                io.to(rooms.get(user.room).users[i].id).emit('getLocation', locs, 'Spy', '');
            }
            else {
                rol = '';
                do {
                    rol = roles[location][Math.floor(Math.random() * roles[location].length)];
                } while(rols.includes(rol));
                rols.push(rol);

                io.to(rooms.get(user.room).users[i].id).emit('getLocation', locs, locations[location], rol);
            }
        }
    })
})

const joinRoom = room => {
    if(rooms.has(room)) {
        return room;
    }
    else {
        if (room != undefined) {
            rooms.set(room, { users: [] });
            return room;
        }
        else {
            do {
                room = Math.floor(Math.random() * 10000).toString();
            } while (rooms.has(room));

            rooms.set(room, { users: [] });
            return room;
        }
    }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT,'192.168.1.104' || 'localhost', () => console.log(`Server running on port ${PORT}`));