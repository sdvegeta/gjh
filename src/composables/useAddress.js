import { reactive, watch } from 'vue'

const KEY = 'guangjiaohui_address_list'

export function useAddressStore() {
    const getLocalList = () => {
        try {
            const data = localStorage.getItem(KEY)
            return data ? JSON.parse(data) : []
        } catch {
            return []
        }
    }

    const addresses = reactive(getLocalList())

    watch(addresses, (newVal) => {
        localStorage.setItem(KEY, JSON.stringify(newVal))
    }, { deep: true })

    const addAddress = (addr) => {
        if (addresses.length >= 3) return false
        // 若是第一个，自动设为默认
        if (addresses.length === 0) {
            addr.isDefault = true
        } else {
            addr.isDefault = false
        }
        addresses.push({ ...addr, id: Date.now() })
        return true
    }

    const updateAddress = (id, newAddr) => {
        const index = addresses.findIndex(x => x.id === id)
        if (index > -1) {
            addresses[index] = { ...addresses[index], ...newAddr }
            return true
        }
        return false
    }

    const removeAddress = (id) => {
        const fn = addresses.findIndex(x => x.id === id)
        if (fn > -1) {
            const wasDefault = addresses[fn].isDefault
            addresses.splice(fn, 1)
            if (wasDefault && addresses.length > 0) {
                addresses[0].isDefault = true
            }
        }
    }

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
