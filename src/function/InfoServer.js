/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Adriansyah | MIT License
 */

import * as Func from "../core/Function.js";

async function InfoServer() {
    let os = (await import('os')).default;
    let v8 = (await import('v8')).default;
    let { performance } = (await import('perf_hooks')).default;
    let eold = performance.now();
    let used = process.memoryUsage();
    let cpus = os.cpus().map(cpu => {
        cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
        return cpu;
    });
    let cpuStats = cpus.reduce(
        (last, cpu) => {
            last.total += cpu.total;
            last.speed += cpu.speed;
            Object.keys(cpu.times).forEach(type => {
                last.times[type] = (last.times[type] || 0) + cpu.times[type];
            });
            return last;
        },
        { speed: 0, total: 0, times: {} }
    );
    let heapStat = v8.getHeapStatistics();
    let neow = performance.now();

    let pingTime = Number(neow - eold).toFixed(2);
    let hostname = os.hostname() || "Unknown Host";
    let platform = os.platform();
    let osVersion = os.version();
    let osRelease = os.release();
    let arch = os.arch();
    let ramTotal = os.totalmem();
    let ramFree = os.freemem();
    let ramUsed = ramTotal - ramFree;

    let runtimeOS = Func.runtime(os.uptime());
    let runtimeBot = Func.runtime(process.uptime());

    let nodeMemoryUsage = Object.keys(used)
        .map(key => `*- ${key.padEnd(20, ' ')} : ${Func.formatSize(used[key])}`)
        .join('\n');

    let heapStats = `
*- Heap Executable :* ${Func.formatSize(heapStat?.total_heap_size_executable)}
*- Physical Size :* ${Func.formatSize(heapStat?.total_physical_size)}
*- Available Size :* ${Func.formatSize(heapStat?.total_available_size)}
*- Heap Limit :* ${Func.formatSize(heapStat?.heap_size_limit)}
*- Malloced Memory :* ${Func.formatSize(heapStat?.malloced_memory)}
*- Peak Malloced Memory :* ${Func.formatSize(heapStat?.peak_malloced_memory)}
*- Does Zap Garbage :* ${Func.formatSize(heapStat?.does_zap_garbage)}
*- Native Contexts :* ${Func.formatSize(heapStat?.number_of_native_contexts)}
*- Detached Contexts :* ${Func.formatSize(heapStat?.number_of_detached_contexts)}
*- Total Global Handles :* ${Func.formatSize(heapStat?.total_global_handles_size)}
*- Used Global Handles :* ${Func.formatSize(heapStat?.used_global_handles_size)}
    `;

    let cpuUsage = `
*- Total CPU Usage :* ${(cpuStats.total / (neow - eold)).toFixed(2)}%
*- CPU Core(s) Usage (${cpus.length} Core CPU) :*
${cpus.map((cpu, i) => ` ${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ) ${Object.keys(cpu.times).map(type => `*- ${(type + '*').padEnd(10, ' ')} : ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n')}
    `;

    let result = `
*Ping :* *_${pingTime} milisecond(s)_*
        
💻 *_Info Server_* 
*- Hostname :* ${hostname}
*- Platform :* ${platform}
*- OS :* ${osVersion} / ${osRelease}
*- Arch :* ${arch}
*- RAM :* ${Func.formatSize(ramUsed)} / ${Func.formatSize(ramTotal)}
        
*_Runtime OS_*
${runtimeOS}
        
*_Runtime Bot_*
${runtimeBot}
        
*_NodeJS Memory Usage_* 
${nodeMemoryUsage}
        
*_Heap Statistics_*
${heapStats}
        
*_CPU Usage_*
${cpuUsage}
    `;

    return result;
}

export default InfoServer;