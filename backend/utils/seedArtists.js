const Artist = require("../models/Artist");
const trendingArtists = require("../data/trendingArtists");

async function seedArtists() {
    const ops = trendingArtists.map((artist) => ({
        updateOne: {
            filter: { name: artist.name },
            update: { $set: artist },
            upsert: true,
        },
    }));

    if (ops.length) {
        await Artist.bulkWrite(ops);
    }
}

module.exports = seedArtists;
