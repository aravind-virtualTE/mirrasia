"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function BankMeetingSchedule() {
    const [date, setDate] = useState<Date>()
    const [hour, setHour] = useState<string>("")
    const [minute, setMinute] = useState<string>("")
    const [period, setPeriod] = useState<string>("AM")

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium text-black">Bank meeting schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 text-sm text-gray-800">
                    Please let us know your preferred date for the bank meeting first, and confirm this with our representative
                    before finalizing your Hong Kong visit. Once the bank meeting schedule is confirmed, please be careful not
                    to change it if possible. Please note that changes cannot be made within two days before the meeting.
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">
                            Desired meeting date <span className="text-red-500">*</span>
                        </Label>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-white",
                                            !date && "text-muted-foreground",
                                        )}
                                    >
                                        {date ? format(date, "dd-MM-yyyy") : "dd-mm-yyyy"}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm font-medium">
                            Preferred meeting time (Hong Kong time) <span className="text-red-500">*</span>
                        </Label>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Time</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    placeholder="--"
                                    className="w-12 text-center bg-white"
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                />
                                <span>:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="--"
                                    className="w-12 text-center bg-white"
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value)}
                                />
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-20 bg-white">
                                        <SelectValue placeholder="AM/PM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AM">AM</SelectItem>
                                        <SelectItem value="PM">PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

