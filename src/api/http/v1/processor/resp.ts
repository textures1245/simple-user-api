export const ok = (msg: string, data: any, status: string = "000") => {
    return {
      message: msg || "SUCCESS",
      status,
      data,
    };
  };
  
  export const msg = (msg: string, status: string = "000") => {
    return {
      message: msg,
      status,
    };
  };