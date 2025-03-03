"use client"

import { useState, useRef, type ChangeEvent, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Download, Scissors, RotateCcw, FastForward, Rewind, Repeat } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function AudioCutterPage() {
  const [audio, setAudio] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("00:00")
  const [endTime, setEndTime] = useState<string>("00:00")
  const [duration, setDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [isLooping, setIsLooping] = useState<boolean>(false)
  const [fadeInDuration, setFadeInDuration] = useState<number>(0)
  const [fadeOutDuration, setFadeOutDuration] = useState<number>(0)
  const [isNormalized, setIsNormalized] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    return () => {}
  }, [])

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const audioUrl = URL.createObjectURL(file)
      setAudio(audioUrl)
      setAudioName(file.name)
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
            setEndTime(formatTime(audioRef.current.duration))
          }
        }
      }
    }
    e.target.value = ""
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const parseTime = (time: string): number => {
    const [minutes, seconds] = time.split(":").map(Number)
    return minutes * 60 + seconds
  }

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = parseTime(e.target.value)
    }
  }

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.currentTime = parseTime(startTime)
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    if (audioRef.current && isLooping) {
      audioRef.current.currentTime = parseTime(startTime)
      audioRef.current.play()
    } else if (audioRef.current) {
      audioRef.current.currentTime = parseTime(startTime)
    }
  }

  const cutAudio = async () => {
    if (!audio) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const response = await fetch(audio)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const startOffset = parseTime(startTime)
    const endOffset = parseTime(endTime)
    const duration = endOffset - startOffset

    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioContext.sampleRate * duration,
      audioContext.sampleRate,
    )

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const newChannelData = newBuffer.getChannelData(channel)
      const originalChannelData = audioBuffer.getChannelData(channel)
      for (let i = 0; i < newBuffer.length; i++) {
        newChannelData[i] = originalChannelData[i + audioContext.sampleRate * startOffset]
      }
    }

    const offlineContext = new OfflineAudioContext(newBuffer.numberOfChannels, newBuffer.length, newBuffer.sampleRate)

    const offlineSource = offlineContext.createBufferSource()
    offlineSource.buffer = newBuffer
    offlineSource.connect(offlineContext.destination)
    offlineSource.start()

    const renderedBuffer = await offlineContext.startRendering()

    const wav = bufferToWave(renderedBuffer, renderedBuffer.length)
    const blob = new Blob([wav], { type: "audio/wav" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `cut_${audioName.replace(/\.[^/.]+$/, "")}.wav`
    link.click()

    audioContext.close()
  }

  function bufferToWave(abuffer: AudioBuffer, len: number) {
    const numOfChan = abuffer.numberOfChannels
    const length = len * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    let sample
    const offset = 0
    let pos = 0

    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length - 8
    setUint32(0x45564157) // "WAVE"

    setUint32(0x20746d66) // "fmt " chunk
    setUint32(16) // length = 16
    setUint16(1) // PCM (uncompressed)
    setUint16(numOfChan)
    setUint32(abuffer.sampleRate)
    setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
    setUint16(numOfChan * 2) // block-align
    setUint16(16) // 16-bit

    setUint32(0x61746164) // "data" - chunk
    setUint32(length - pos - 4) // chunk length

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      const channel = abuffer.getChannelData(i)
      for (let j = 0; j < channel.length; j++) {
        sample = Math.max(-1, Math.min(1, channel[j]))
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
        view.setInt16(pos, sample, true)
        pos += 2
      }
    }

    return buffer

    function setUint16(data: number) {
      view.setUint16(pos, data, true)
      pos += 2
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true)
      pos += 4
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }

  const handleExport = () => {
    // Implement audio export logic here
  }

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setStartTime("00:00")
      setEndTime(formatTime(audioRef.current.duration))
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 5
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 5
    }
  }

  const toggleLoop = () => {
    setIsLooping(!isLooping)
    if (audioRef.current) {
      audioRef.current.loop = !isLooping
    }
  }

  const handleFadeInChange = (value: number) => {
    setFadeInDuration(value)
  }

  const handleFadeOutChange = (value: number) => {
    setFadeOutDuration(value)
  }

  const normalizeAudio = () => {
    setIsNormalized(!isNormalized)
    // Implement audio normalization logic here
  }

  return (
    <div className="space-y-4 pb-16">
      <h1 className="text-3xl font-bold">Audio Cutter</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Audio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById("audio-upload")?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Audio File
            </Button>
            <Input id="audio-upload" type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            {audioName && <p className="text-sm text-muted-foreground break-all">{audioName}</p>}
          </div>
        </CardContent>
      </Card>

      {audio && (
        <Card>
          <CardHeader>
            <CardTitle>Cut Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={audio}
                onEnded={handleAudioEnded}
                className="w-full mb-4"
                controls
                loop={isLooping}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="text"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    placeholder="00:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input id="end-time" type="text" value={endTime} onChange={handleEndTimeChange} placeholder="00:00" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={cutAudio} className="flex-1 sm:flex-none">
                  <Scissors className="w-4 h-4 mr-2" />
                  Cut & Download
                </Button>
                <Button onClick={() => handlePlaybackRateChange(1)} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button onClick={skipBackward} variant="outline" size="icon">
                  <Rewind className="w-4 h-4" />
                </Button>
                <Button onClick={skipForward} variant="outline" size="icon">
                  <FastForward className="w-4 h-4" />
                </Button>
                <Button onClick={toggleLoop} variant={isLooping ? "default" : "outline"} size="icon">
                  <Repeat className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? "default" : "outline"}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className="w-16"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Fade In Duration (seconds)</Label>
                  <Slider
                    value={[fadeInDuration]}
                    onValueChange={([value]) => handleFadeInChange(value)}
                    max={5}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fade Out Duration (seconds)</Label>
                  <Slider
                    value={[fadeOutDuration]}
                    onValueChange={([value]) => handleFadeOutChange(value)}
                    max={5}
                    step={0.1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="normalize-audio" checked={isNormalized} onCheckedChange={normalizeAudio} />
                  <Label htmlFor="normalize-audio">Normalize Audio</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExport} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

