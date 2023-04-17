import superagent from "superagent";
import store from "@/store";

export default {
    async get(operation, requestParams) {
        return new Promise((resolve, reject) => {
            superagent.get(window.location.href)
                .set("Content-Type", "application/json")
                .query({requestData: JSON.stringify({operation, requestParams})})
                .end((err, res) => { _handle(err, res, reject, resolve); });
        });
    },
    async post(operation, requestParams) {
        return new Promise((resolve, reject) => {
            superagent.post(window.location.href)
                .set("Content-Type", "application/json")
                .set("Accept", "json")
                .send({operation, requestParams})
                .end((err, res) => { _handle(err, res, reject, resolve); });
        });
    }
}

function _handle(err, res, reject, resolve) {
    let errorMessage = err || (res.body.error || null);

    if (errorMessage) {
        store.dispatch('handleException', {title: 'An error occurred', message: errorMessage}, {root: true}).then();
        reject(errorMessage);
    } else resolve(res.body);
}