export const Response=(res,statusCode,success,mnessage,data)=>{
    return res.status(statusCode).json({
        success,
        message,
        ...Response(data && {data}),
    })
}