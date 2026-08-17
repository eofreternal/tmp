import { like } from "drizzle-orm"

export function arrayContains(column: any, value: string) {
    return like(column, `%,${value},%`)
}