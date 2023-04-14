import superagent from "superagent";

export default {
    async get(operation, requestParams) {
        return new Promise((resolve, reject) => {
            superagent.get(window.location.href)
                .set("Content-Type", "application/json")
                .query({requestData: JSON.stringify({operation, requestParams})})
                .end((err, res) => {
                    if (err) reject(err);
                    else if (res.body.error) reject(res.body.error);
                    else resolve(res.body);
                });
        });
    },
    async post(operation, requestParams) {
        return new Promise((resolve, reject) => {
            superagent.post(window.location.href)
                .set("Content-Type", "application/json")
                .set("Accept", "json")
                .send({operation, requestParams})
                .end((err, res) => {
                    if (err) reject(err);
                    else if (res.body.error) reject(res.body.error);
                    else resolve(res.body);
                });
        });
    }
}