"use client"

import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Lock, Unlock, FlipHorizontal, FlipVertical, SunMedium, ImagePlus, Filter } from "lucide-react"

const filters = {
  normal: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0 },
  vintage: { brightness: 120, contrast: 90, saturation: 85, sepia: 50, grayscale: 0 },
  blackAndWhite: { brightness: 100, contrast: 120, saturation: 0, sepia: 0, grayscale: 100 },
  sepia: { brightness: 110, contrast: 110, saturation: 90, sepia: 100, grayscale: 0 },
  cool: { brightness: 100, contrast: 100, saturation: 150, sepia: 0, grayscale: 0 },
  warm: { brightness: 110, contrast: 105, saturation: 120, sepia: 30, grayscale: 0 },
}

export default function ImageEditorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [width, setWidth] = useState(300)
  const [height, setHeight] = useState(300)
  const [originalWidth, setOriginalWidth] = useState(300)
  const [originalHeight, setOriginalHeight] = useState(300)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [sepia, setSepia] = useState(0)
  const [grayscale, setGrayscale] = useState(0)
  const [aspectLocked, setAspectLocked] = useState(true)
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [quality, setQuality] = useState(90)
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "webp">("png")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setOriginalWidth(img.width)
          setOriginalHeight(img.height)
          setWidth(img.width)
          setHeight(img.height)
          const imageData = event.target?.result as string
          setImage(imageData)
          setBrightness(100)
          setContrast(100)
          setSaturation(100)
          setBlur(0)
          setSepia(0)
          setGrayscale(0)
          setRotation(0)
          setFlipX(false)
          setFlipY(false)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (aspectLocked) {
      setHeight(Math.round((newWidth / originalWidth) * originalHeight))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (aspectLocked) {
      setWidth(Math.round((newHeight / originalHeight) * originalWidth))
    }
  }

  const handleReset = () => {
    if (image) {
      const img = new Image()
      img.onload = () => {
        setWidth(originalWidth)
        setHeight(originalHeight)
        setRotation(0)
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
        setBlur(0)
        setSepia(0)
        setGrayscale(0)
        setFlipX(false)
        setFlipY(false)
        drawImage()
      }
      img.src = image
    }
  }

  const applyFilter = (filterName: keyof typeof filters) => {
    const filter = filters[filterName]
    setBrightness(filter.brightness)
    setContrast(filter.contrast)
    setSaturation(filter.saturation)
    setSepia(filter.sepia)
    setGrayscale(filter.grayscale)
  }

  const drawImage = () => {
    if (!image) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = width
      canvas.height = height

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%)`

      ctx.drawImage(img, -width / 2, -height / 2, width, height)

      ctx.restore()
    }
    img.src = image
  }

  useEffect(() => {
    drawImage()
  }, [image, width, height, rotation, brightness, contrast, saturation, blur, sepia, grayscale, flipX, flipY])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const link = document.createElement("a")

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          link.href = url
          link.download = `edited-image.${downloadFormat}`
          link.click()
          URL.revokeObjectURL(url)
        }
      },
      `image/${downloadFormat}`,
      quality / 100,
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Image Editor</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {!image ? (
              <div className="flex flex-col items-center gap-4 w-full p-8">
                <ImagePlus className="w-16 h-16 text-muted-foreground" />
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  Choose Image
                </Button>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            ) : (
              <>
                <ScrollArea className="w-full rounded-lg border" id="image-preview">
                  <div className="relative p-4">
                    <canvas ref={canvasRef} className="max-w-full h-auto mx-auto" />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="resize">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Resize
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Lock Aspect Ratio</Label>
                      <div className="flex items-center space-x-2">
                        {aspectLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        <Switch checked={aspectLocked} onCheckedChange={setAspectLocked} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Width (px)</Label>
                        <Input
                          type="number"
                          value={width}
                          onChange={(e) => handleWidthChange(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (px)</Label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => handleHeightChange(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filters">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(filters).map((filterName) => (
                      <Button
                        key={filterName}
                        variant="outline"
                        onClick={() => applyFilter(filterName as keyof typeof filters)}
                      >
                        {filterName}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="adjust">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <SunMedium className="w-4 h-4 mr-2" />
                    Adjust
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Brightness ({brightness}%)</Label>
                      <Slider
                        value={[brightness]}
                        onValueChange={([value]) => setBrightness(value)}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contrast ({contrast}%)</Label>
                      <Slider
                        value={[contrast]}
                        onValueChange={([value]) => setContrast(value)}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Saturation ({saturation}%)</Label>
                      <Slider
                        value={[saturation]}
                        onValueChange={([value]) => setSaturation(value)}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blur ({blur}px)</Label>
                      <Slider value={[blur]} onValueChange={([value]) => setBlur(value)} min={0} max={10} step={0.1} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sepia ({sepia}%)</Label>
                      <Slider value={[sepia]} onValueChange={([value]) => setSepia(value)} min={0} max={100} step={1} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grayscale ({grayscale}%)</Label>
                      <Slider
                        value={[grayscale]}
                        onValueChange={([value]) => setGrayscale(value)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="transform">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Transform
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rotation ({rotation}°)</Label>
                      <Slider
                        value={[rotation]}
                        onValueChange={([value]) => setRotation(value)}
                        min={0}
                        max={360}
                        step={1}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" onClick={() => setFlipX(!flipX)}>
                        <FlipHorizontal className="w-4 h-4 mr-2" />
                        Flip H
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setFlipY(!flipY)}>
                        <FlipVertical className="w-4 h-4 mr-2" />
                        Flip V
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="export">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quality ({quality}%)</Label>
                      <Slider
                        value={[quality]}
                        onValueChange={([value]) => setQuality(value)}
                        min={1}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Download Format</Label>
                      <Select
                        value={downloadFormat}
                        onValueChange={(value: "png" | "jpeg" | "webp") => setDownloadFormat(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

