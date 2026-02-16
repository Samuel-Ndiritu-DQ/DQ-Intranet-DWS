type EventName =
  | 'Guides.ViewList'
  | 'Guides.Search'
  | 'Guides.FilterChanged'
  | 'Guides.SortChanged'
  | 'Guides.CardClick'
  | 'Guides.CTA'
  | 'Guides.ViewDetail'
  | 'Guides.OpenGuide'
  | 'Guides.Download'
  | 'Guides.RelatedClick'
  | 'Guides.Share'
  | 'Guides.Print'
  | 'Guides.TabChanged'
  | 'Guides.ViewAll'

export const track = (name: EventName, payload: Record<string, unknown>) => {
  try {
    // Hook here to your analytics provider. For now, log once per action.
    console.info('[analytics]', name, payload)
  } catch (err) {
    console.warn('[analytics] track failed', err)
  }
}
