/**
 * 收餐地址业务逻辑与状态管理 (Composable)
 * 本文件作为前端原型到真实研发的无缝衔接资产
 */
import { reactive, watch } from 'vue'

const KEY = 'guangjiaohui_address_list'

export function useAddressStore() {
    // Logic: 从本地缓存初始化地址列表
    const getLocalList = () => {
        try {
            const data = localStorage.getItem(KEY)
            return data ? JSON.parse(data) : []
        } catch {
            return []
        }
    }

    const addresses = reactive(getLocalList())

    // Logic: 监听状态变化并持久化
    watch(addresses, (newVal) => {
        localStorage.setItem(KEY, JSON.stringify(newVal))
    }, { deep: true })

    /**
     * 新增收餐地址
     * // TODO: 前端接手后，此处需替换为 POST /api/address/create 接口调用
     */
    const addAddress = (addr) => {
        if (addresses.length >= 3) return false

        // 自动设为默认地址逻辑
        if (addresses.length === 0) {
            addr.isDefault = true
        } else {
            addr.isDefault = false
        }

        // 模拟 API 生成 ID 与时间戳
        addresses.push({ ...addr, id: Date.now() })
        return true
    }

    /**
     * 更新收餐地址
     * // TODO: 前端接手后，此处需替换为 PUT /api/address/update/:id 接口调用
     */
    const updateAddress = (id, newAddr) => {
        const index = addresses.findIndex(x => x.id === id)
        if (index > -1) {
            addresses[index] = { ...addresses[index], ...newAddr }
            return true
        }
        return false
    }

    /**
     * 删除收餐地址
     * // TODO: 前端接手后，此处需替换为 DELETE /api/address/delete/:id 接口调用
     */
    const removeAddress = (id) => {
        const fn = addresses.findIndex(x => x.id === id)
        if (fn > -1) {
            const wasDefault = addresses[fn].isDefault
            addresses.splice(fn, 1)
            // 若删除的是默认地址，则自动将第一个设为默认
            if (wasDefault && addresses.length > 0) {
                addresses[0].isDefault = true
            }
        }
    }

    /**
     * 设置默认地址 (仅本地 UI 操作)
     */
    const setDefault = (id) => {
        addresses.forEach(x => {
            x.isDefault = (x.id === id)
        })
    }

    return {
        addresses,
        addAddress,
        updateAddress,
        removeAddress,
        setDefault
    }
}
