const w = [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
    0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655,
    0.6621,
];

const s_0 = (g) => {
    return w[g-1]
}

const s_new_recall = (d, s, r, g) => {
    const multiplier = (g) => {
        if(g == 2) return w[15]
        if(g == 4) return w[16]
        return 1;
    }
    return s * (Math.E**w[8] * (11 - d) * s**(-w[9])*(Math.E**(w[10]*(1-r))-1) * multiplier(g) + 1)
}

const s_new_forget = (d,s,r) => {
    return w[11] * d**(-w[12])*((s+1)**w[13] - 1)*Math.E**(w[14]*(1-r))
}

const s = (d, s, r, g) => {
    if(r == -1) return s_0(g);
    if(g == 1) return s_new_forget(d,s,r)
    return s_new_recall(d,s,r,g);
}

const s_same_day = (s, g) => {
    return s * Math.E**(w[17] * (g - 3 + w[18]));
}

const d_0 = (g) => {
    return w[4] - Math.E**(w[5] * (g-1)) + 1
}

const d_new = (d_old, g) => {
    const delta_d = -w[6] * (g - 3)
    return w[7] * d_0(4) + (1-w[7]) * (d_old + delta_d*(10-d_old)/9)
}

const d = (d_old, g) => {
    if(d_old == -1) return d_0(g);
    return d_new(d_old, g);
}



const r = (t, s) => {
    return (1 + (19/81)*(t/s))**(-0.5)
  }

const i = (r, s) => {
    const decay = -0.5;
    const factor = 19/81;
    return (s / factor) * (r**(1/decay) - 1)
  }

exports.s = s;
exports.s_same_day = s_same_day;
exports.d = d;
exports.r = r;
exports.i = i;