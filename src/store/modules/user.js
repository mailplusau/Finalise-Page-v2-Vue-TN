import http from "@/utils/http";

const state = {
    role: null,
    id: null,
};

const getters = {
    role : state => state.role,
    id : state => state.id,

    isMatthew : state => state.id === 1777309,

    isAdmin : state => [3, 1032].includes(state.role)
};

const mutations = {};

const actions = {
    init : async context => {
        let {role, id} = await http.get('getCurrentUserDetails');

        context.state.role = parseInt(role);
        context.state.id = parseInt(id);
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};