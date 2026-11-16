Add-Type -AssemblyName System.Drawing
$outDir = 'D:/chokan-uranai-web/outputs/app-store-header-2026-11-16'
$sourceDir = 'C:/Users/User/.codex/generated_images/01a1e4d8-5541-76f2-a3b1-1aaf762021b5'
$items = @(
  @{ Name='A-front-storm-calm'; Source='exec-690461dd-8291-42ea-a234-2b303f4ab601.png' },
  @{ Name='B-left-moonlit-calm'; Source='exec-9f093e40-7f0b-4965-9816-8aadbec14414.png' },
  @{ Name='C-right-clearing-storm'; Source='exec-194dd0fe-b9fb-4b56-9990-28146c1ad2b2.png' }
)
foreach ($item in $items) {
  $source = [System.Drawing.Image]::FromFile((Join-Path $sourceDir $item.Source))
  $bitmap = [System.Drawing.Bitmap]::new(5244,2950,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $attrs = [System.Drawing.Imaging.ImageAttributes]::new()
  $attrs.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,5244,2950),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel,$attrs)
  $bitmap.Save((Join-Path $outDir ($item.Name+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(145,230,240,245),4)
  $g.DrawRectangle($pen,[single]1048.8,[single]590,[single]3146.4,[single]1770)
  $bitmap.Save((Join-Path $outDir ($item.Name+'-safe60.png')),[System.Drawing.Imaging.ImageFormat]::Png)
  $preview = [System.Drawing.Bitmap]::new(1311,737,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $pg = [System.Drawing.Graphics]::FromImage($preview)
  $pg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $pg.DrawImage($bitmap,0,0,1311,737)
  $preview.Save((Join-Path $outDir ($item.Name+'-preview.jpg')),[System.Drawing.Imaging.ImageFormat]::Jpeg)
  Write-Output ($item.Name+': source '+$source.Width+'x'+$source.Height+' => 5244x2950 RGB PNG + guide')
  $pg.Dispose(); $preview.Dispose(); $pen.Dispose(); $attrs.Dispose(); $g.Dispose(); $bitmap.Dispose(); $source.Dispose()
}
$files = Get-ChildItem -LiteralPath $outDir -Filter '*.png'
Compress-Archive -LiteralPath $files.FullName -DestinationPath (Join-Path $outDir 'chokan-app-store-3-variants.zip')
foreach ($file in $files) {
  $check = [System.Drawing.Image]::FromFile($file.FullName)
  Write-Output ($file.Name+' '+$check.Width+'x'+$check.Height+' '+$check.PixelFormat)
  $check.Dispose()
}
