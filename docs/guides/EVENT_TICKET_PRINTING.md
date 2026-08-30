# Event-ticket QR and print boundaries

docn-ui event tickets generate local PDF graphics from validated data. The QR encodes exactly the provided `qrPayload`; it is not a signature, reservation, payment record, attendee database, or access-control decision.

## What the template guarantees

- The QR is vector artwork with a light four-module quiet zone and a minimum physical module size.
- Payloads above 512 UTF-8 bytes or too dense for the selected QR area fail explicitly instead of producing a smaller unreadable symbol.
- The event instant is stored separately from its IANA time zone and displayed in that selected zone.
- Classic and Live use qualified landscape formats. Conference has separate A6 portrait and 150 × 70 mm landscape compositions.

Automated qualification rasterizes the final post-processed PDF and decodes the pixels with an implementation independent from the encoder. This proves that the fixed fixture is digitally decodable after PDF generation. It does not prove that every phone, scanner, paper, ink, or printer will decode every physical copy.

## Access control is a separate system

Anyone who can read or copy the payload can reproduce the same QR. A production admission system must separately decide whether a payload is authentic, current, unique, revoked, or already used. Do not describe these templates as tamper-proof or secure tickets unless the surrounding system actually provides and audits those properties.

## Printing and cutting

Use 100% scale and disable fit-to-page. Verify printer margins and run a real scan before a production batch. Crop marks and dashed separators are graphic guides only: they do not impose sheets, control a cutter, or guarantee mechanical alignment. The first printed trial remains a required physical qualification distinct from automated PDF and raster checks.
