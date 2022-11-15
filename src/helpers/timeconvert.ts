export default function timeconvert(due_date: string) { 
 
    const due_date_regex = /(\w+) (\d+), (\d+) at (\d+):(\d+)/ 

    const [month, day, year, hour, minute] = due_date.match(due_date_regex) || []

    const now = new Date() 

    const due_date_date = new Date(`${month} ${day}, ${year} ${hour}:${minute}`)
    const due_date_date_unix = due_date_date.getTime() / 1000

    const now_unix = now.getTime() / 1000
    const diff = due_date_date_unix - now_unix

    return diff
}