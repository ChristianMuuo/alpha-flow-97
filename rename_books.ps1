$files = Get-ChildItem "c:\Users\ADMIN\alphaflow\alpha-flow-97\public\books\*.pdf"
$books = @()
$counter = 1

foreach ($file in $files) {
    if ($file.Name -match "^smc-book-\d+\.pdf$") {
        # Skip if already renamed to avoid double renaming on re-runs
        $newName = $file.Name
    } else {
        $newName = "smc-book-$counter.pdf"
        $newPath = Join-Path $file.DirectoryName $newName
        Rename-Item -Path $file.FullName -NewName $newName -ErrorAction SilentlyContinue
    }
    
    # Extract titles cleaner
    $originalName = $file.Name
    $title = $originalName -replace ".pdf", "" -replace "@SmartMoneyCourse", "" -replace "SmartMoneyCourse", "" -replace "_", " " -replace "-", " " -replace "\(\d+\)", "" -replace "\s+", " "
    $title = $title.Trim()

    $book = @{
        title = $title
        author = "Smart Money Concept"
        category = "Smart Money Concepts"
        description = "SMC trading educational material."
        file_url = "/books/$newName"
        cover_url = $null
    }
    $books += $book
    $counter++
}

$books | ConvertTo-Json -Depth 4 | Set-Content "c:\Users\ADMIN\alphaflow\alpha-flow-97\public\books\smc_books.json" -Encoding UTF8
Write-Host "Books renamed and JSON generated."
