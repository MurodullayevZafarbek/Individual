const token = window.localStorage.getItem("token")

const decodeToken = () => {
    const axiosMe = axios.get("/api/user/decode", { headers: { Authorization: token } })
        .then((res) => {
            const user = res.data
            return user
            
        })
    return axiosMe
}