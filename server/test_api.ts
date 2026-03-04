import axios from 'axios';
async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/experiences/feed?limit=1');
        console.log("Full First Experience:");
        console.log(JSON.stringify(res.data.experiences[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
